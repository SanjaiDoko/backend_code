const Room = require("../schema/room.js");
const Booking = require("../schema/booking.js");
const mongoose = require("mongoose");
const { ObjectId } = require("bson");
const db = require("../model/mongodb");
const { scheduleEmail, scheduleStartAndEnd } = require("../model/common.js");

module.exports = () => {
    let router = {};

    router.getRoom = async (req, res) => {
        try {
            let getRoom = req.body,
                getInfo,
                getId;
            getRoom = getRoom.data[0];
            getId = new mongoose.Types.ObjectId(getRoom.id);
            getInfo = await Room.aggregate([
                { $match: { _id: getId } },
                {
                    $lookup: {
                        from: "bookings",
                        localField: "_id",
                        foreignField: "roomId",
                        as: "TotalBooking",
                    },
                },
                { $unwind: "$TotalBooking" },
                { $match: { "TotalBooking.status": 1 } },
                {
                    $project: {
                        _id: 0,
                        "TotalBooking._id": 1,
                        "TotalBooking.userBooked": 1,
                        "TotalBooking.bookedReason": 1,
                        "TotalBooking.sessionDate": 1,
                        "TotalBooking.startsAt": 1,
                        "TotalBooking.endsAt": 1,
                    },
                },
            ]);

            if (getInfo.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(getInfo) });
            } else {
                let info = getInfo.map((event) => {
                    let arr = new Object();
                    arr.bookingId = event.TotalBooking._id
                    arr.userBooked = event.TotalBooking.userBooked;
                    arr.bookedReason = event.TotalBooking.bookedReason;
                    arr.date = event.TotalBooking.sessionDate;
                    arr.startsAt = event.TotalBooking.startsAt;
                    arr.endsAt = event.TotalBooking.endsAt;
                    return arr;
                });
                return res.send({ status: 1, data: JSON.stringify(info) });
            }
        } catch (error) {
            return res.send({ status: 0, response: error });
        }
    };

    router.getAllRooms = async (req, res) => {
        try {
            let roomsList = await db.findDocuments("room");
            if (roomsList.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(roomsList) });
            } else {
                let info = roomsList.map((event) => {
                    let arr = new Object();
                    arr.roomId = event._id;
                    arr.roomName = event.roomName;
                    arr.roomNo = event.roomNo;
                    arr.preBookings = event.preBookings;
                    arr.status = event.status;
                    arr.activeStatus = event.activeStatus;
                    arr.currentMeeting = event.currentMeeting;
                    return arr;
                });
                return res.send({ status: 1, data: JSON.stringify(info) });
            }
        } catch (error) {
            return res.send({ status: 0, response: error });
        }
    };

    router.bookRoom = async (req, res) => {
        try {
            let bookRoom = req.body,
                getBooking,
                checkExist,
                getUser;
            bookRoom = bookRoom.data[0];

            if (bookRoom.endsAt < bookRoom.startsAt) {
                return res.send({
                    status: 0,
                    response: "starting time and ending time is not valid",
                });
            }
            checkExist = await db.findSingleDocument("booking", {
                $and: [
                    { roomId: bookRoom.roomId },
                    {
                        startsAt: {
                            $lte: bookRoom.endsAt,
                        },
                    },
                    {
                        endsAt: {
                            $gte: bookRoom.startsAt,
                        },
                    },
                    { status: 1 },
                ],
            });

            if (checkExist !== null) {
                if (checkExist.status === 1 || checkExist.status === 2) {
                    return res.send({
                        status: 0,
                        response: `Not available, This slot was already booked by ${checkExist.userBooked} `,
                    });
                }
            }
            getUser = await db.findSingleDocument("user", { _id: bookRoom.bookedBy });
            bookRoom.userBooked = getUser.fullName;
            getBooking = await db.insertSingleDocument("booking", bookRoom);
            await db.updateOneDocument(
                "booking",
                { _id: getBooking._id },
                { sessionDate: getBooking.startsAt, email: getUser.email }
            );
            await db.findByIdAndUpdate("room", getBooking.roomId, {
                $inc: { preBookings: 1 },
            });

            scheduleEmail(getBooking.startsAt, getUser.email, getBooking.emailcc, getBooking.bookedReason)
            scheduleStartAndEnd(getBooking.startsAt, getBooking.endsAt, getBooking._id)
            return res.send({ status: 1, response: "New booking created" });
        } catch (error) {
            return res.send({ status: 0, response: error });
        }
    };

    router.cancelMeeting = async (req, res) => {
        try {
            let cancelMeeting = req.body,
                getInfo;
            cancelMeeting = cancelMeeting.data[0];

            getInfo = await Booking.findById({ _id: cancelMeeting.id });
            if (!getInfo) {
                return res.send({ status: 1, data: JSON.stringify(getInfo) });
            }
            if (getInfo.status === 1) {
                await db.updateOneDocument(
                    "booking",
                    { _id: new ObjectId(cancelMeeting.id) },
                    { status: 0 }
                );
                await db.findByIdAndUpdate("room", getInfo.roomId, {
                    $inc: { preBookings: -1 },
                });
                return res.send({ status: 1, reponse: "Meeting cancelled" });
            } else {
                return res.send({ status: 1, response: "Not a valid status" });
            }
        } catch (error) {
            return res.send({ status: 0, response: error });
        }
    };


    router.getMyBookings = async (req, res) => {
        try {
            let getMyHistory = req.body,
                getEvents;

            getMyHistory = getMyHistory.data[0];
            getEvents = await Booking.aggregate([
                {
                    $lookup: {
                        from: "rooms",
                        localField: "roomId",
                        foreignField: "_id",
                        as: "RoomDetails",
                    },
                },
            ]);

            if (getEvents.length === 0) {
                return res.send({ status: 1, data: JSON.stringify(getEvents) });
            }

            let info = getEvents.map((event) => {
                let arr = {};
                arr.bookingId = event._id
                arr.roomName = event.RoomDetails[0].roomName;
                arr.roomNo = event.RoomDetails[0].roomNo;
                arr.bookedReason = event.bookedReason;
                arr.date = event.sessionDate;
                arr.startsAt = event.startsAt;
                arr.endsAt = event.endsAt;
                arr.status = event.status;
                return arr;
            });

            return res.send({ status: 1, data: JSON.stringify(info) });
        } catch (error) {
            return res.send({ status: 0, response: error });
        }
    };

    return router;
};

// router.startMeeting = async (req, res) => {
//     try {
//         let startMeeting = req.body, getInfo;
//         startMeeting = startMeeting.data[0];

//         getInfo = await Booking.findById({ _id: startMeeting.id })
//         if (!getInfo) {
//             return res.send({ status: 0, response: getInfo })
//         }
//         if (getInfo.status === 1) {
//             await db.updateOneDocument("booking",
//                 { _id: new ObjectId(startMeeting.id) },
//                 { status: 2 })
//             await db.findByIdAndUpdate("room", getInfo.roomId, { status: 1, currentMeeting: { bookedBy: getInfo.bookedBy, reason: getInfo.bookedFor } })
//             return res.send({ status: 1, reponse: "Meeting started" })
//         }
//         if (getInfo.status === 2) {
//             return res.send({ status: 1, response: "Meeting already started" })
//         }
//         else {
//             return res.send({ status: 0, response: "Not a valid status" })
//         }
//     } catch (error) {
//         return res.send({ status: 0, response: error })
//     }
// }

// router.endMeeting = async (req, res) => {
//     try {
//         let stopMeeting = req.body, getInfo;
//         stopMeeting = stopMeeting.data[0];

//         getInfo = await Booking.findById({ _id: stopMeeting.id })

//         if (getInfo.status === 2) {
//             await db.updateOneDocument("booking",
//                 { _id: new ObjectId(stopMeeting.id) },
//                 { status: 3, actualEndTime: Date.now() })
//             await db.findByIdAndUpdate("room", getInfo.roomId, { status: 0, $inc: { preBookings: -1 } })
//             return res.send({ status: 1, reponse: "Meeting ended" })
//         }
//         if (getInfo.status === 3) {
//             return res.send({ status: 1, response: "Meeting as already been stopped" })
//         }
//         else {
//             return res.send({ status: 0, response: "Not a valid status" })
//         }
//     } catch (error) {
//         return res.send({ status: 0, response: error })
//     }
// }
// router.getByDate = async (req, res) => {
//     try {
//         let getByDate = req.body, getEvents, totalEvents;
//         getByDate = getByDate.data[0];
//         getEvents = await db.findDocuments("booking", { roomId: new ObjectId(getByDate.roomId), sessionDate: getByDate.date })
//         if (getEvents.length === 0) {
//             return res.send({ status: 1, response: getEvents })
//         }
//         totalEvents = getEvents.length
//         let info = getEvents.map((event) => {
//             let arr = new Object()
//             arr.bookedBy = event.bookedBy
//             arr.bookedFor = event.bookedFor
//             arr.date = event.sessionDate
//             arr.startsAt = event.startsAt
//             arr.endsAt = event.endsAt
//             return arr
//         })
//         return res.send({ status: 1, response: { totalEvents: totalEvents, info } })
//     } catch (error) {
//         return res.send({ status: 0, response: error })
//     }
// }

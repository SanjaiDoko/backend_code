const Room = require('../schema/room.js')
const Booking = require('../schema/booking.js')
const mongoose = require("mongoose")
const { ObjectId } = require("bson");
const db = require("../model/mongodb");
const { scheduleEmail } = require('../model/common.js')
module.exports = () => {
    let router = {}

    router.getRoom = async (req, res) => {
        try {
            let getRoom = req.body, getInfo, getId;
            getRoom = getRoom.data[0]
            getId = new mongoose.Types.ObjectId(getRoom.id)
            getInfo = await Room.aggregate([
                { $match: { _id: getId } },
                {
                    $lookup: {
                        from: "bookings",
                        localField: "_id",
                        foreignField: "roomId",
                        as: "TotalBooking"
                    }
                },
                { $unwind: "$TotalBooking" },
                { $match: { "TotalBooking.status": 1 } },
                { $project: { _id: 1, roomName: 1, "TotalBooking.status": 1, "TotalBooking.bookedBy": 1, "TotalBooking.sessionDate": 1, "TotalBooking.startsAt": 1, "TotalBooking.endsAt": 1 } },
            ])
            if (getRoom.length === 0) {
                return res.send({ status: 0, response: getRoom })
            }
            else {
                return res.send({ status: 1, response: getRoom })
            }
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }

    router.getAllRooms = async (req, res) => {
        try {
            let roomsList = await Room.find()
            if (roomsList.length === 0) {
                return res.send({ status: 1, response: roomsList })
            }
            else {
                return res.send({ status: 1, response: roomsList })
            }
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }

    router.bookRoom = async (req, res) => {
        try {
            let bookRoom = req.body, getBooking, checkExist;
            bookRoom = bookRoom.data[0]

            if (bookRoom.endsAt < bookRoom.startsAt) {
                return res.send({ status: 0, response: "starting time and ending time is not valid" })
            }
            checkExist = await Booking.findOne({
                sessionDate: bookRoom.sessionDate,
                $and: [{
                    startsAt: {
                        $lte: bookRoom.endsAt
                    }
                }, {
                    endsAt: {
                        $gte: bookRoom.startsAt
                    }
                }, { status: 1 }]
            })

            if (checkExist !== null) {
                if (checkExist.status === 1 || checkExist.status === 2) {
                    return res.send({ status: 0, response: `Not available, it slot was booked by ${checkExist.bookedBy} ` })
                }
            }

            getBooking = await db.insertSingleDocument("booking", bookRoom)
            await db.findByIdAndUpdate("room", getBooking.roomId, { $inc: { preBookings: 1 } })
            // scheduleEmail(getBooking.startsAt, getBooking.email, getBooking.emailcc, getBooking.bookedFor)
            return res.send({ status: 1, response: "New booking created" })
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }

    router.startMeeting = async (req, res) => {
        try {
            let startMeeting = req.body, getInfo;
            startMeeting = startMeeting.data[0];

            getInfo = await Booking.findById({ _id: startMeeting.id })
            if (!getInfo) {
                return res.send({ status: 0, response: getInfo })
            }
            if (getInfo.status === 1) {
                await db.updateOneDocument("booking",
                    { _id: new ObjectId(startMeeting.id) },
                    { status: 2 })
                await db.findByIdAndUpdate("room", getInfo.roomId, { status: 1, currentMeeting: { bookedBy: getInfo.bookedBy, reason: getInfo.bookedFor } })
                return res.send({ status: 1, reponse: "Meeting started" })
            }
            if (getInfo.status === 2) {
                return res.send({ status: 1, response: "Meeting already started" })
            }
            else {
                return res.send({ status: 0, response: "Not a valid status" })
            }
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }

    router.endMeeting = async (req, res) => {
        try {
            let stopMeeting = req.body, getInfo;
            stopMeeting = stopMeeting.data[0];

            getInfo = await Booking.findById({ _id: stopMeeting.id })

            if (getInfo.status === 2) {
                await db.updateOneDocument("booking",
                    { _id: new ObjectId(stopMeeting.id) },
                    { status: 3, actualEndTime: Date.now() })
                await db.findByIdAndUpdate("room", getInfo.roomId, { status: 0, $inc: { preBookings: -1 } })
                return res.send({ status: 1, reponse: "Meeting ended" })
            }
            if (getInfo.status === 3) {
                return res.send({ status: 1, response: "Meeting as already been stopped" })
            }
            else {
                return res.send({ status: 0, response: "Not a valid status" })
            }
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }


    router.cancelMeeting = async (req, res) => {
        try {
            let cancelMeeting = req.body, getInfo;
            cancelMeeting = cancelMeeting.data[0];

            getInfo = await Booking.findById({ _id: cancelMeeting.id })
            if (!getInfo) {
                return res.send({ status: 1, response: getInfo })
            }
            if (getInfo.status === 1) {
                await db.updateOneDocument("booking",
                    { _id: new ObjectId(cancelMeeting.id) },
                    { status: 0 })
                await db.findByIdAndUpdate("room", getInfo.roomId, { $inc: { preBookings: -1 } })
                return res.send({ status: 1, reponse: "Meeting cancelled" })
            }
            else {
                return res.send({ status: 1, response: "Not a valid status" })
            }
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }


    router.getByDate = async (req, res) => {
        try {
            let getByDate = req.body, getEvents, totalEvents;
            getByDate = getByDate.data[0];
            getEvents = await db.findDocuments("booking", { roomId: new ObjectId(getByDate.roomId) ,sessionDate: getByDate.date })
            if (getEvents.length === 0) {
                return res.send({ status: 1, response: getEvents })
            }
            totalEvents = getEvents.length
            return res.send({ status: 1, response: { totalEvents: totalEvents, getEvents } })
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }

    return router
}
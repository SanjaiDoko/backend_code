const Room = require('../schema/room.js')
const Booking = require('../schema/booking.js')
const mongoose = require("mongoose")
const { scheduleEmail } = require('../model/common.js')
module.exports = () => {
    let router = {}

    router.getRoom = async (req, res) => {
        try {
            let { id } = req.body, getRoom, getId;
            getId = new mongoose.Types.ObjectId(id)
            getRoom = await Room.aggregate([
                { $match: { _id: getId } },
                {
                    $lookup: {
                        from: "bookings",
                        localField: "_id",
                        foreignField: "roomId",
                        as: "TotalBooking"
                    }
                },
                //    {$match:{"TotalBooking.status":1}},
                // {$project:{"getData":1}}
                { $unwind: "$TotalBooking" },
                { $match: { "TotalBooking.status": 1 } },
                // {$project:{getInfo:1}}
                { $project: { _id: 1, roomName: 1, "TotalBooking.status": 1, "TotalBooking.bookedBy": 1, "TotalBooking.sessionDate": 1, "TotalBooking.startsAt": 1, "TotalBooking.endsAt": 1 } },
            ])
            if (!getRoom) {
                return res.send({ status: 0, response: "No room found" })
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
                return res.send({ status: 0, response: "No avaliable rooms" })
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
            let { roomId, bookedBy, bookedFor, email, emailcc, description, priority, headCount, sessionDate, startsAt, endsAt } = req.body, getBooking;

            if (endsAt < startsAt) {
                return res.send({ status: 0, response: "starting time and ending time is not valid" })
            }
            const bookings = await Booking.findOne({
                sessionDate: sessionDate,
                $and: [{
                    startsAt: {
                        $lte: endsAt
                    }
                }, {
                    endsAt: {
                        $gte: startsAt
                    }
                }, { status: 1 }]
            })

            if (bookings !== null) {
                if (bookings.status === 1 || bookings.status === 2) {
                    return res.send({ status: 0, response: `Not available, it slot was booked by ${bookings.bookedBy} ` })
                }
            }

            getBooking = await Booking.create({ roomId, bookedBy, bookedFor, description, headCount, priority, sessionDate, startsAt: startsAt, endsAt: endsAt, email, emailcc })
            await Room.findByIdAndUpdate({ _id: roomId }, { $inc: { preBookings: 1 } })
            scheduleEmail(getBooking.startsAt, getBooking.email, getBooking.emailcc, getBooking.bookedFor)
            return res.send({ status: 1, response: "New booking created" })
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }

    router.startMeeting = async (req, res) => {
        try {
            let { id } = req.body, getInfo;
            getInfo = await Booking.findById({ _id: id })
            if (!getInfo) {
                return res.send({ status: 0, response: "No booking found" })
            }
            if (getInfo.status === 1) {
                await Booking.updateOne({ _id: id }, { status: 2 })
                await Room.findByIdAndUpdate({ _id: getInfo.roomId }, { status: 1, currentMeeting: { bookedBy: getInfo.bookedBy, reason: getInfo.bookedFor } })
                return res.send({ status: 1, reponse: "Meeting started" })
            }
            else {
                return res.send({ status: 0, response: "Something went wrong" })
            }
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }

    router.endMeeting = async (req, res) => {
        try {
            let { id } = req.body, getInfo;
            getInfo = await Booking.findById({ _id: id })

            if (getInfo.status === 2) {
                await Booking.updateOne({ _id: id }, { status: 3, actualEndTime: Date.now() })
                await Room.findByIdAndUpdate({ _id: getInfo.roomId }, { status: 0, $inc: { preBookings: -1 } })
                return res.send({ status: 1, reponse: "Meeting ended" })
            }
            else {
                return res.send({ status: 0, response: "Something went wrong" })
            }
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }


    router.cancelMeeting = async (req, res) => {
        try {
            let { id } = req.body, getInfo;
            getInfo = await Booking.findById({ _id: id })
            if (!getInfo) {
                return res.send({ status: 0, response: "No booking found" })
            }
            if (getInfo.status === 1) {
                await Booking.updateOne({ _id: id }, { status: 0 })
                await Room.findByIdAndUpdate({ _id: getInfo.roomId }, { $inc: { preBookings: -1 } })
                return res.send({ status: 1, reponse: "Meeting cancelled" })
            }
            else {
                return res.send({ status: 0, response: "Something went wrong" })
            }
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }


    router.getByDate = async (req, res) => {
        try {
            let { date, roomId } = req.body, getEvents, totalEvents;
            getEvents = await Booking.find({ roomId: roomId, sessionDate: date })
            if (!getEvents) {
                return res.send({ status: 0, response: "No events found" })
            }
            totalEvents = getEvents.length
            return res.send({ status: 1, response: { totalEvents: totalEvents, getEvents } })
        } catch (error) {
            return res.send({ status: 0, response: error })
        }
    }

    return router
}
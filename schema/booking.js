const mongoose = require("mongoose")

let ObjectId = mongoose.Schema.Types.ObjectId

const bookingSchema = mongoose.Schema({
    roomId: {
        type: ObjectId,
        ref: "rooms"
    },
    bookedBy: {
        type: ObjectId
    },
    userBooked: {
        type: String
    },
    bookedReason: {
        type: String
    },
    priority: {
        type: Number,
        default: 2
    },
    headCount: {
        type: Number
    },
    sessionDate: {
        type: Date
    },
    startsAt: {
        type: Date
    },
    endsAt: {
        type: Date
    },
    actualEndTime: {
        type: Date
    },
    status: {
        type: Number,
        default: 1
    },
    email: {
        type: String
    },
    emailcc: {
        type: [String]
    }
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('bookings', bookingSchema)
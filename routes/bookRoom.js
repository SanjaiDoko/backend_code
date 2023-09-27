const { ensureAuthorized } = require("../model/auth.js")


module.exports = (app) => {

    const booking = require("../controllers/booking.js")()
    const bookingValidation = require("../validation/booking/booking")()

    app.get("/room/getAllRooms",ensureAuthorized, booking.getAllRooms)
    app.post("/room/getRoomById", ensureAuthorized, bookingValidation.getRoom, booking.getRoom)
    app.post("/room/bookRoom", ensureAuthorized, bookingValidation.checkCreateBooking, booking.bookRoom)
    app.post("/room/cancelMeeting", ensureAuthorized, bookingValidation.cancelBooking, booking.cancelMeeting)
    app.post("/room/getMyBookings", ensureAuthorized, bookingValidation.getMyBookings, booking.getMyBookings)
}

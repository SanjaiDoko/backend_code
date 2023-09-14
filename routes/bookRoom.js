

module.exports = (app) => {

    const booking = require("../controllers/booking.js")()
    const bookingValidation = require("../validation/booking/booking")()

    app.get("/room/getAllRooms", booking.getAllRooms)
    app.post("/room/getRoomById", bookingValidation.getRoom, booking.getRoom)
    app.post("/room/bookRoom", bookingValidation.checkCreateBooking, booking.bookRoom)
    app.post("/room/cancelMeeting", bookingValidation.cancelBooking, booking.cancelMeeting)
    app.post("/room/getMyBookings", bookingValidation.getMyBookings, booking.getMyBookings)
}
// app.post("/room/startMeet", booking.startMeeting)
// app.post("/room/endMeeting", booking.endMeeting)
// app.post("/room/getEvents", booking.getByDate)
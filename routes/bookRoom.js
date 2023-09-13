

module.exports = (app) => {

    const booking = require("../controllers/booking.js")()

    app.get("/getAllRooms", booking.getAllRooms)
    app.get("/getRoomById", booking.getRoom)
    app.post("/bookRoom", booking.bookRoom)
    app.post("/startMeet", booking.startMeeting)
    app.post("/endMeeting", booking.endMeeting)
    app.post("/cancelMeeting", booking.cancelMeeting)
    app.post("/getEvents", booking.getByDate)
}
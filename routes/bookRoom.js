

module.exports = (app) => {

    const booking = require("../controllers/booking.js")()

    app.get("/room/getAllRooms", booking.getAllRooms)
    app.get("/room/getRoomById", booking.getRoom)
    app.post("/room/bookRoom", booking.bookRoom)
    app.post("/room/startMeet", booking.startMeeting)
    app.post("/room/endMeeting", booking.endMeeting)
    app.post("/room/cancelMeeting", booking.cancelMeeting)
    app.post("/room/getEvents", booking.getByDate)
}
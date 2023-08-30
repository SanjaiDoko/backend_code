module.exports = (app) => {

    const ticket = require('../controllers/ticket')()

    const ticketValidation = require("../validation/ticket/ticketValidation")()

    app.post("/ticket/getTicketsByUserId", ticketValidation.checkId, ticket.getTicketsByUserId)

    app.post("/ticket/insertTicket",  ticket.createTicket)

    app.post("/ticket/updateTicket", ticket.updateTicket)

    app.post("/ticket/getAllRecievedTicketsByUserId", ticket.getAllRecievedTicketsByUserId)

}
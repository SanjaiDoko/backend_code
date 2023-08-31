module.exports = (app) => {

    const ticket = require('../controllers/ticket')()

    const ticketValidation = require("../validation/ticket/ticketValidation")()

    app.post("/ticket/getTicketsByUserId", ticketValidation.checkId, ticket.getTicketsByUserId)

    app.post("/ticket/insertTicket", ticketValidation.createTicket,  ticket.createTicket)

    app.post("/ticket/updateTicket", ticketValidation.updateTicket, ticket.updateTicket)

    app.post("/ticket/getAllRecievedTicketsByManagerId", ticket.getAllRecievedTicketsManagerId)

    app.post("/ticket/getAllRecievedTicketsByUserId", ticket.getAllRecievedTicketsByUserId)

    app.post("/ticket/getTicketById", ticketValidation.checkId, ticket.getTicketById)

}
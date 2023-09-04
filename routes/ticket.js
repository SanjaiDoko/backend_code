const {ensureAuthorized} = require("../model/auth")

module.exports = (app) => {

    const ticket = require('../controllers/ticket')()

    const ticketValidation = require("../validation/ticket/ticketValidation")()

    app.post("/ticket/getTicketsByUserId", ensureAuthorized, ticketValidation.checkId, ticket.getTicketsByUserId)

    app.post("/ticket/insertTicket", ensureAuthorized, ticketValidation.createTicket,  ticket.createTicket)

    app.post("/ticket/updateTicket", ensureAuthorized, ticketValidation.updateTicket, ticket.updateTicket)

    app.post("/ticket/getAllRecievedTicketsByManagerId", ensureAuthorized, ticket.getAllRecievedTicketsManagerId)

    app.post("/ticket/getAllRecievedTicketsByUserId", ensureAuthorized, ticket.getAllRecievedTicketsByUserId)

    app.post("/ticket/getTicketById", ensureAuthorized, ticketValidation.checkId, ticket.getTicketById)

}
const {ensureAuthorized} = require("../model/auth")

module.exports = (app) => {

    const ticket = require('../controllers/ticket')()

    const ticketValidation = require("../validation/ticket/ticketValidation")()

    app.post("/ticket/getTicketsByUserId", ensureAuthorized, ticketValidation.checkId, ticket.getTicketsByUserId)

    app.post("/ticket/insertTicket", ensureAuthorized, ticketValidation.createTicket,  ticket.createTicket)

    app.post("/ticket/updateTicket", ensureAuthorized, ticketValidation.updateTicket, ticket.updateTicket)

    app.post("/ticket/managerUpdateTicket", ensureAuthorized, ticketValidation.managerUpdateTicket, ticket.managerUpdateTicket)

    app.post("/ticket/assignedUpdateTicket", ensureAuthorized, ticketValidation.assignedUpdateTicket, ticket.assignedUpdateTicket)

    app.post("/ticket/getAllRecievedTicketsByManagerId", ensureAuthorized, ticketValidation.checkId, ticket.getAllRecievedTicketsManagerId)

    app.post("/ticket/getAllRecievedTicketsByUserId", ensureAuthorized, ticketValidation.checkId, ticket.getAllRecievedTicketsByUserId)

    app.post("/ticket/getTicketById", ensureAuthorized, ticketValidation.checkId, ticket.getTicketById)

}
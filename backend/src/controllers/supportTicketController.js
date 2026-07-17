const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const supportTicketService = require('../services/supportTicketService');
const messageService = require('../services/messaging/messageService');
const supportTicketSchema = require('../models/supportTicketModel');

exports.createTicket = asyncHandler(async (req, res) => {
    const { error } = supportTicketSchema.createTicket.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const result = await supportTicketService.createTicket(req.user.id, req.body);
    res.status(201).json({ success: true, data: result });
});

exports.getMyTickets = asyncHandler(async (req, res) => {
    const { status, search, limit, offset } = req.query;
    const tickets = await supportTicketService.getUserTickets(req.user.id, {
        status,
        search,
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
    });
    res.status(200).json({ success: true, data: tickets });
});

exports.getTicket = asyncHandler(async (req, res) => {
    const ticket = await supportTicketService.getTicket(req.params.id, req.user);
    res.status(200).json({ success: true, data: ticket });
});

exports.sendTicketMessage = asyncHandler(async (req, res) => {
    const { error } = supportTicketSchema.sendMessage.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const message = await supportTicketService.sendTicketMessage(
        req.params.id,
        req.user,
        req.body.message,
    );
    res.status(201).json({ success: true, data: message });
});

exports.getTicketMessages = asyncHandler(async (req, res) => {
    const ticket = await supportTicketService.getTicket(req.params.id, req.user);
    const { cursor, limit } = req.query;
    const messages = await messageService.getMessages(ticket.conversation_id, req.user, {
        cursor,
        limit: parseInt(limit, 10) || 30,
    });
    res.status(200).json({ success: true, data: messages });
});

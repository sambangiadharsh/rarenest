const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const supportTicketService = require('../services/supportTicketService');
const messageService = require('../services/messaging/messageService');
const supportTicketSchema = require('../models/supportTicketModel');
const userRepository = require('../repositories/userRepository');


exports.getAdmins = asyncHandler(async (req, res) => {
    const admins = await userRepository.findAdmins();
    res.status(200).json({ success: true, data: admins });
});

exports.getAllTickets = asyncHandler(async (req, res) => {
    const { category, priority, status, search, limit, offset } = req.query;
    const result = await supportTicketService.getAllTickets({
        category,
        priority,
        status,
        search,
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
    });
    res.status(200).json({
        success: true,
        count: result.count,
        data: result.tickets,
    });
});

exports.getTicket = asyncHandler(async (req, res) => {
    const ticket = await supportTicketService.getTicket(req.params.id, req.user);
    res.status(200).json({ success: true, data: ticket });
});

exports.assignTicket = asyncHandler(async (req, res) => {
    const { error } = supportTicketSchema.assignTicket.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const result = await supportTicketService.assignTicket(
        req.params.id,
        req.body.admin_id,
        req.user,
    );
    res.status(200).json({ success: true, data: result });
});

exports.updateStatus = asyncHandler(async (req, res) => {
    const { error } = supportTicketSchema.updateStatus.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const ticket = await supportTicketService.updateStatus(
        req.params.id,
        req.body.status,
        req.user,
    );
    res.status(200).json({ success: true, data: ticket });
});

exports.updatePriority = asyncHandler(async (req, res) => {
    const { error } = supportTicketSchema.updatePriority.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const ticket = await supportTicketService.updatePriority(
        req.params.id,
        req.body.priority,
        req.user,
    );
    res.status(200).json({ success: true, data: ticket });
});

exports.addInternalNote = asyncHandler(async (req, res) => {
    const { error } = supportTicketSchema.internalNote.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const message = await supportTicketService.addInternalNote(
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

exports.getAdmins = asyncHandler(async (req, res) => {
    const admins = await userRepository.findAdmins();
    res.status(200).json({ success: true, data: admins });
});

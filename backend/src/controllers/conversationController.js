const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const conversationService = require('../services/messaging/conversationService');
const messageService = require('../services/messaging/messageService');
const messageSchema = require('../models/messageModel');

exports.getConversations = asyncHandler(async (req, res) => {
    const { type, archived, limit, offset } = req.query;
    const conversations = await conversationService.listConversations(req.user.id, req.user, {
        type,
        archived: archived === 'true' ? true : archived === 'all' ? 'all' : false,
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
    });
    res.status(200).json({ success: true, data: conversations });
});

exports.getConversation = asyncHandler(async (req, res) => {
    const conversation = await conversationService.getConversation(req.params.id, req.user);
    res.status(200).json({ success: true, data: conversation });
});

exports.getMessages = asyncHandler(async (req, res) => {
    const { cursor, limit } = req.query;
    const messages = await messageService.getMessages(req.params.id, req.user, {
        cursor,
        limit: parseInt(limit, 10) || 30,
    });
    res.status(200).json({ success: true, data: messages });
});

exports.sendMessage = asyncHandler(async (req, res) => {
    const { error } = messageSchema.sendMessage.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const message = await messageService.sendMessage({
        conversationId: req.params.id,
        user: req.user,
        message: req.body.message,
        messageType: req.body.message_type || 'TEXT',
    });
    res.status(201).json({ success: true, data: message });
});

exports.uploadAttachment = asyncHandler(async (req, res) => {
    const result = await messageService.sendAttachment(req.params.id, req.user, req.file);
    res.status(201).json({ success: true, data: result });
});

exports.markRead = asyncHandler(async (req, res) => {
    const { error } = messageSchema.markRead.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const participant = await conversationService.markRead(
        req.params.id,
        req.user,
        req.body.message_id,
    );
    messageService.emitToConversation(req.params.id, 'message:read', {
        conversationId: req.params.id,
        userId: req.user.id,
        messageId: req.body.message_id,
    });
    res.status(200).json({ success: true, data: participant });
});

exports.archiveConversation = asyncHandler(async (req, res) => {
    const { error } = messageSchema.archive.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const participant = await conversationService.archiveConversation(
        req.params.id,
        req.user,
        req.body.is_archived,
    );
    res.status(200).json({ success: true, data: participant });
});



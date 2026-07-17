const path = require('path');
const conversationRepository = require('../../repositories/conversationRepository');
const messageRepository = require('../../repositories/messageRepository');
const participantService = require('./participantService');
const notificationService = require('./notificationService');
const supportTicketRepository = require('../../repositories/supportTicketRepository');
const storageService = require('../storageService');
const limits = require('../../config/mediaLimits');
const AppError = require('../../utils/AppError');

const MESSAGE_ATTACHMENT_MIMES = [
    ...limits.IMAGE_MIMES,
    'application/pdf',
];

class MessageService {
    getIo() {
        return global.__socketIo || null;
    }

    emitToConversation(conversationId, event, payload) {
        const io = this.getIo();
        if (io) {
            io.to(`conv:${conversationId}`).emit(event, payload);
        }
    }

    emitToUser(userId, event, payload) {
        const io = this.getIo();
        if (io) {
            io.to(`user:${userId}`).emit(event, payload);
        }
    }

    async sendMessage({
        conversationId,
        user,
        message,
        messageType = 'TEXT',
        isInternal = false,
        skipNotification = false,
    }) {
        const conv = await participantService.assertParticipant(conversationId, user, {
            requireWritable: true,
        });

        if (isInternal && user.role !== 'Admin') {
            throw new AppError('Only admins can send internal notes', 403);
        }

        if (conv.type === 'SUPPORT' && !isInternal) {
            const ticket = await supportTicketRepository.findByConversationId(conversationId);
            if (ticket?.status === 'Closed' && user.role !== 'Admin') {
                throw new AppError('This ticket is closed', 403);
            }
        }

        const created = await messageRepository.create({
            conversation_id: conversationId,
            sender_id: user.id,
            message: message?.trim() || null,
            message_type: messageType,
            is_internal: isInternal,
        });

        await conversationRepository.updateLastMessageAt(conversationId, created.created_at);

        const fullMessage = await messageRepository.getMessageWithSender(created.id);

        this.emitToConversation(conversationId, 'message:new', fullMessage);
        this.emitToConversation(conversationId, 'conversation:updated', {
            conversationId,
            last_message_at: created.created_at,
            last_message_preview: created.message,
        });

        if (!skipNotification && !isInternal) {
            await this.notifyParticipants(conversationId, user, fullMessage, conv);
        }

        return fullMessage;
    }

    async notifyParticipants(conversationId, sender, message, conversation) {
        const participants = await participantService.getParticipants(conversationId);
        const ticket = conversation.type === 'SUPPORT'
            ? await supportTicketRepository.findByConversationId(conversationId)
            : null;

        for (const p of participants) {
            if (String(p.user_id) === String(sender.id)) continue;

            let type = conversation.type === 'PROPERTY' ? 'PROPERTY_MESSAGE' : 'SUPPORT_MESSAGE';
            let title = conversation.type === 'PROPERTY'
                ? 'New property message'
                : 'New support message';
            let body = message.message
                ? message.message.substring(0, 200)
                : `Sent a ${message.message_type.toLowerCase()}`;

            if (ticket) {
                title = `Support: ${ticket.subject}`;
            }

            const notification = await notificationService.createNotification({
                user_id: p.user_id,
                type,
                title,
                body,
            });
            this.emitToUser(p.user_id, 'notification:new', notification);
        }
    }

    async getMessages(conversationId, user, { cursor, limit = 30 } = {}) {
        await participantService.assertParticipant(conversationId, user);
        const includeInternal = user.role === 'Admin';
        const messages = await messageRepository.findByConversation(conversationId, {
            cursor,
            limit,
            includeInternal,
            userId: user.id,
        });
        return messages.reverse();
    }

    async sendAttachment(conversationId, user, file) {
        if (!file) {
            throw new AppError('No file uploaded', 400);
        }
        if (!MESSAGE_ATTACHMENT_MIMES.includes(file.mimetype)) {
            throw new AppError('Only images and PDF files are allowed', 400);
        }

        const maxSize = limits.IMAGE_MIMES.includes(file.mimetype)
            ? limits.MAX_IMAGE_BYTES
            : limits.MAX_DOCUMENT_BYTES;
        if (file.size > maxSize) {
            throw new AppError('File exceeds size limit', 400);
        }

        const messageType = limits.IMAGE_MIMES.includes(file.mimetype) ? 'IMAGE' : 'FILE';
        const ext = path.extname(file.originalname) || '';
        const fileKey = `messages/${conversationId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        const fileUrl = await storageService.saveBuffer(fileKey, file.buffer);

        const created = await this.sendMessage({
            conversationId,
            user,
            message: file.originalname,
            messageType,
            skipNotification: false,
        });

        const attachment = await messageRepository.createAttachment({
            message_id: created.id,
            file_url: fileUrl,
            file_name: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size,
        });

        const fullMessage = await messageRepository.getMessageWithSender(created.id);
        this.emitToConversation(conversationId, 'message:new', fullMessage);

        return { ...fullMessage, attachment };
    }
}

module.exports = new MessageService();

const conversationRepository = require('../../repositories/conversationRepository');
const supportTicketRepository = require('../../repositories/supportTicketRepository');
const propertyRepository = require('../../repositories/propertyRepository');
const AppError = require('../../utils/AppError');

class ParticipantService {
    async isParticipant(conversationId, userId) {
        const participant = await conversationRepository.findParticipant(conversationId, userId);
        return !!participant;
    }

    async assertParticipant(conversationId, user, options = {}) {
        const conversation = await conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new AppError('Conversation not found', 404);
        }

        if (user.role === 'Admin' && conversation.type === 'SUPPORT') {
            return conversation;
        }

        if (conversation.type === 'PROPERTY') {
            const sellerId = await propertyRepository.findSellerIdByPropertyId(conversation.property_id);
            const isBuyer = String(conversation.buyer_id) === String(user.id);
            const isSeller = sellerId && String(sellerId) === String(user.id);
            if (!isBuyer && !isSeller) {
                throw new AppError('Not authorized to access this conversation', 403);
            }
            return conversation;
        }

        if (conversation.type === 'SUPPORT') {
            const ticket = await supportTicketRepository.findByConversationId(conversationId);
            if (!ticket) {
                throw new AppError('Support ticket not found', 404);
            }
            const isOwner = String(ticket.user_id) === String(user.id);
            const isAssigned = ticket.assigned_admin_id
                && String(ticket.assigned_admin_id) === String(user.id);
            if (!isOwner && !isAssigned && user.role !== 'Admin') {
                throw new AppError('Not authorized to access this conversation', 403);
            }
            if (options.requireWritable && ticket.status === 'Closed' && user.role !== 'Admin') {
                throw new AppError('This ticket is closed', 403);
            }
            return conversation;
        }

        const participant = await conversationRepository.findParticipant(conversationId, user.id);
        if (!participant) {
            throw new AppError('Not authorized to access this conversation', 403);
        }
        return conversation;
    }

    async addParticipant(conversationId, userId) {
        return conversationRepository.addParticipant({ conversation_id: conversationId, user_id: userId });
    }

    async getParticipants(conversationId) {
        return conversationRepository.getParticipants(conversationId);
    }
}

module.exports = new ParticipantService();

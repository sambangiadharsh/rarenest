const conversationRepository = require('../../repositories/conversationRepository');
const participantService = require('./participantService');
const AppError = require('../../utils/AppError');

class ConversationService {
    async getConversation(conversationId, user) {
        await participantService.assertParticipant(conversationId, user);
        const conversation = await conversationRepository.findById(conversationId);
        const participants = await conversationRepository.getParticipants(conversationId);
        const participant = await conversationRepository.findParticipant(conversationId, user.id);

        return {
            ...conversation,
            participants,
            is_archived: participant?.is_archived ?? false,
            last_read_message_id: participant?.last_read_message_id ?? null,
        };
    }

    async listConversations(userId, user, filters = {}) {
        const includeInternal = user.role === 'Admin';
        const conversations = await conversationRepository.findByUserId(userId, filters);

        if (!includeInternal) {
            return conversations;
        }
        return conversations;
    }

    async archiveConversation(conversationId, user, isArchived) {
        await participantService.assertParticipant(conversationId, user);
        const updated = await conversationRepository.setArchived(
            conversationId,
            user.id,
            isArchived,
        );
        if (!updated) {
            throw new AppError('Participant not found', 404);
        }
        return updated;
    }

    async markRead(conversationId, user, messageId) {
        await participantService.assertParticipant(conversationId, user);
        return conversationRepository.updateLastRead(conversationId, user.id, messageId);
    }
}

module.exports = new ConversationService();

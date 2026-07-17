const conversationRepository = require('../repositories/conversationRepository');
const propertyRepository = require('../repositories/propertyRepository');
const participantService = require('./messaging/participantService');
const AppError = require('../utils/AppError');

class PropertyChatService {
    async openConversation(buyerId, propertyId) {
        const sellerId = await propertyRepository.findSellerIdByPropertyId(propertyId);
        if (!sellerId) {
            throw new AppError('Property not found', 404);
        }
        if (String(sellerId) === String(buyerId)) {
            throw new AppError('You cannot message yourself about your own listing', 400);
        }

        let conversation = await conversationRepository.findPropertyConversation(propertyId, buyerId);
        let isNew = false;

        if (!conversation) {
            conversation = await conversationRepository.create({
                type: 'PROPERTY',
                property_id: propertyId,
                buyer_id: buyerId,
                created_by: buyerId,
            });
            await participantService.addParticipant(conversation.id, buyerId);
            await participantService.addParticipant(conversation.id, sellerId);
            isNew = true;
        }

        const participants = await conversationRepository.getParticipants(conversation.id);
        return { conversation, participants, isNew };
    }
}

module.exports = new PropertyChatService();

const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const propertyChatService = require('../services/propertyChatService');
const propertyChatSchema = require('../models/propertyChatModel');

exports.openPropertyChat = asyncHandler(async (req, res) => {
    const { error } = propertyChatSchema.openPropertyChat.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const result = await propertyChatService.openConversation(
        req.user.id,
        req.body.property_id,
    );
    res.status(result.isNew ? 201 : 200).json({
        success: true,
        data: result,
        message: result.isNew ? 'Conversation created' : 'Conversation opened',
    });
});

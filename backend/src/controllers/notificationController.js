const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/messaging/notificationService');

exports.getNotifications = asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const notifications = await notificationService.getNotifications(req.user.id, {
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
    });
    res.status(200).json({ success: true, data: notifications });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({ success: true, data: { count } });
});

exports.markRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: notification });
});

exports.markAllRead = asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user.id);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

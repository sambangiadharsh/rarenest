const notificationRepository = require('../../repositories/notificationRepository');

class NotificationService {
    getIo() {
        return global.__socketIo || null;
    }

    async createNotification({ user_id, type, title, body }) {
        const notification = await notificationRepository.create({
            user_id,
            type,
            title,
            body,
        });

        const io = this.getIo();
        if (io) {
            io.to(`user:${user_id}`).emit('notification:new', notification);
        }

        return notification;
    }

    async getNotifications(userId, pagination = {}) {
        return notificationRepository.findByUserId(userId, pagination);
    }

    async getUnreadCount(userId) {
        return notificationRepository.getUnreadCount(userId);
    }

    async markRead(id, userId) {
        return notificationRepository.markRead(id, userId);
    }

    async markAllRead(userId) {
        return notificationRepository.markAllRead(userId);
    }
}

module.exports = new NotificationService();

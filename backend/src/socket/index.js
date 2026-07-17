const { Server } = require('socket.io');
const { authenticateSocket } = require('./auth');
const participantService = require('../services/messaging/participantService');
const messageService = require('../services/messaging/messageService');
const conversationService = require('../services/messaging/conversationService');

function initSocket(server) {
    const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:8001',
        process.env.MANAGE_URL,
        'http://localhost:8002',
    ].filter(Boolean);
    
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    global.__socketIo = io;

    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        socket.join(`user:${socket.user.id}`);

        socket.on('conversation:join', async ({ conversationId }) => {
            try {
                await participantService.assertParticipant(conversationId, socket.user);
                socket.join(`conv:${conversationId}`);
                socket.data.joinedConversations.add(conversationId);
                socket.emit('conversation:joined', { conversationId });
            } catch (err) {
                socket.emit('error', { message: err.message || 'Not authorized' });
            }
        });

        socket.on('conversation:leave', ({ conversationId }) => {
            socket.leave(`conv:${conversationId}`);
            socket.data.joinedConversations.delete(conversationId);
            socket.emit('conversation:left', { conversationId });
        });

        socket.on('message:send', async ({ conversationId, message, messageType }) => {
            try {
                const fullMessage = await messageService.sendMessage({
                    conversationId,
                    user: socket.user,
                    message,
                    messageType: messageType || 'TEXT',
                });
                socket.emit('message:sent', { id: fullMessage.id });
            } catch (err) {
                socket.emit('error', { message: err.message || 'Failed to send message' });
            }
        });

        socket.on('message:read', async ({ conversationId, messageId }) => {
            try {
                await conversationService.markRead(conversationId, socket.user, messageId);
                io.to(`conv:${conversationId}`).emit('message:read', {
                    conversationId,
                    userId: socket.user.id,
                    messageId,
                });
            } catch (err) {
                socket.emit('error', { message: err.message || 'Failed to mark read' });
            }
        });

        socket.on('disconnect', () => {
            for (const convId of socket.data.joinedConversations) {
                socket.leave(`conv:${convId}`);
            }
            socket.data.joinedConversations.clear();
        });
    });

    return io;
}

module.exports = { initSocket };



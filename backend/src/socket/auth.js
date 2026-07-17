const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
require('dotenv').config();

function extractToken(socket) {
    if (socket.handshake.auth?.token) {
        return socket.handshake.auth.token;
    }

    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader) {
        const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
        if (match) return match[1];
    }

    const authHeader = socket.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return null;
}

async function authenticateSocket(socket, next) {
    try {
        const token = extractToken(socket);
        if (!token) {
            return next(new Error('Not authorized'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userRepository.findAuthFieldsById(decoded.id);
        if (!user) {
            return next(new Error('User not found'));
        }

        socket.user = user;
        socket.data.joinedConversations = new Set();
        next();
    } catch (err) {
        next(new Error('Not authorized'));
    }
}

module.exports = { authenticateSocket };

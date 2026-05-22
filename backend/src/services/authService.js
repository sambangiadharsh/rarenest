const userRepository = require('../repositories/userRepository');

class AuthService {
    async findUserByEmail(email) {
        return userRepository.findByEmail(email);
    }

    async findUserById(id) {
        return userRepository.findById(id);
    }

    async createUser(userData) {
        return userRepository.create(userData);
    }

    async updateResetToken(userId, hashedToken, expireDate) {
        return userRepository.updateResetToken(userId, hashedToken, expireDate);
    }

    async findUserByResetToken(hashedToken) {
        return userRepository.findByResetToken(hashedToken);
    }

    async updatePassword(userId, hashedPassword) {
        return userRepository.updatePassword(userId, hashedPassword);
    }
}

module.exports = new AuthService();

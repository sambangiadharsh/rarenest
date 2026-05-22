const userRepository = require('../repositories/userRepository');

class UserService {
    async getProfile(userId) {
        return userRepository.findProfileById(userId);
    }

    async updateProfile(userId, profileData) {
        return userRepository.updateProfile(userId, profileData);
    }
}

module.exports = new UserService();

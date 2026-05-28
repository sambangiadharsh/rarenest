const userRepository = require('../repositories/userRepository');
const propertyRepository = require('../repositories/propertyRepository');
const enquiryRepository = require('../repositories/enquiryRepository');

class DashboardService {
    async getStats() {
        const [users, properties, enquiries] = await Promise.all([
            userRepository.countAll(),
            propertyRepository.countAll(),
            enquiryRepository.countAll(),
        ]);

        return {
            users,
            properties,
            enquiries,
        };
    }
}

module.exports = new DashboardService();

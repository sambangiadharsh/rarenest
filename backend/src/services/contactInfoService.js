const contactInfoRepository = require('../repositories/contactInfoRepository');

class ContactInfoService {
    getContactInfo() {
        return contactInfoRepository.findLatest();
    }

    upsertContactInfo(data, userId) {
        return contactInfoRepository.upsert(data, userId);
    }
}

module.exports = new ContactInfoService();

const careerRepository = require('../repositories/careerRepository');

class CareerService {
    getOpenCareers() {
        return careerRepository.findAll({ openOnly: true });
    }

    getAllCareers() {
        return careerRepository.findAll();
    }

    async getOpenCareerById(id) {
        const career = await careerRepository.findById(id, { openOnly: true });
        if (!career) {
            const err = new Error('Career not found');
            err.statusCode = 404;
            throw err;
        }
        return career;
    }

    async createCareer(data) {
        return careerRepository.create(data);
    }

    async updateCareer(id, data) {
        const career = await careerRepository.findById(id);
        if (!career) {
            const err = new Error('Career not found');
            err.statusCode = 404;
            throw err;
        }
        return careerRepository.update(id, data);
    }

    async deleteCareer(id) {
        const career = await careerRepository.findById(id);
        if (!career) {
            const err = new Error('Career not found');
            err.statusCode = 404;
            throw err;
        }
        await careerRepository.delete(id);
    }
}

module.exports = new CareerService();

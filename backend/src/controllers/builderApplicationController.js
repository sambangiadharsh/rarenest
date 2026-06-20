const builderApplicationRepository = require('../repositories/builderApplicationRepository');
const builderRepository = require('../repositories/builderRepository');

exports.submitApplication = async (req, res) => {
    try {
        const { company_name, company_description } = req.body;
        if (!company_name || !company_description) {
            return res.status(400).json({ success: false, message: 'Please provide company name and description.' });
        }

        const existingApp = await builderApplicationRepository.findByUserId(req.user.id);
        if (existingApp) {
            if (existingApp.status === 'Pending') {
                return res.status(400).json({ success: false, message: 'You already have a builder application pending approval.' });
            }
            if (existingApp.status === 'Approved') {
                return res.status(400).json({ success: false, message: 'Your builder profile is already approved.' });
            }
        }

        const newApp = await builderApplicationRepository.create({
            user_id: req.user.id,
            company_name,
            company_description
        });

        res.status(201).json({ success: true, data: newApp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getMyApplication = async (req, res) => {
    try {
        const app = await builderApplicationRepository.findByUserId(req.user.id);
        res.status(200).json({ success: true, data: app });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const apps = await builderApplicationRepository.findAll();
        res.status(200).json({ success: true, count: apps.length, data: apps });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.reviewApplication = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Approved', 'Rejected'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid status: Approved or Rejected.' });
        }

        const app = await builderApplicationRepository.findById(req.params.id);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Builder application not found.' });
        }

        const updatedApp = await builderApplicationRepository.updateStatus(req.params.id, {
            status,
            adminId: req.user.id
        });

        if (status === 'Approved') {
            // Create/Ensure BuilderProfile for the user
            await builderRepository.ensureProfile(app.user_id, 'Approved', app.company_description);
        } else if (status === 'Rejected') {
            // Update builder profile status if it existed
            const profile = await builderRepository.findProfileByUserId(app.user_id);
            if (profile) {
                await builderRepository.updateBuilderStatus(profile.id, 'Rejected');
            }
        }

        res.status(200).json({ success: true, data: updatedApp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

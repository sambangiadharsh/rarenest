const jwt = require('jsonwebtoken');

exports.getChatToken = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const name = req.user.name || 
                     (req.user.first_name ? `${req.user.first_name} ${req.user.last_name || ''}`.trim() : null) || 
                     'User';
        const email = req.user.email;
      
        if (!process.env.CHAT_SECRET) {
            return res.status(500).json({ success: false, message: 'CHAT_SECRET is not configured' });
        }

        const payload = {
            externalId: userId.toString(),
            name: name,
            email: email,
        };
        // sign the payload of current user details with chat secret and hesaDesk backend will verify this chat jwt token using the workspace secret 
        const token = jwt.sign(payload, process.env.CHAT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error generating chat token:', error);
        next(error);
    }
};

const authService = require('../services/authService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, socialLinks } = req.body;
        const result = await authService.registerUser({ 
            name, 
            email, 
            password, 
            phone, 
            socialLinks 
        });
        res.status(201).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || 'Server error' 
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser({ email, password });
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || 'Server error' 
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const result = await authService.getCurrentUser(req.user.id);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || 'Server error' 
        });
    }
};

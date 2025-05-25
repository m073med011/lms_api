const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware to verify the token and attach the user to the request object
exports.protect = async (req, res, next) => {
    let token;

    // Check for the token in the 'x-auth-token' header
    if (req.headers['x-auth-token']) {
        token = req.headers['x-auth-token'];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the user to the request object
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

// Restrict access based on user roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if the user's role is allowed to access the route
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

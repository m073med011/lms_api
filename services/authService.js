const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

class AuthService {
    // Generate JWT Token
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
    }

    // Register new user
    async registerUser({ name, email, password, phone,role, socialLinks }) {
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new AppError('User already exists', 400);
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role,
            socialLinks
        });

        return {
            success: true,
            token: this.generateToken(user._id),
            user: {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                phone: user.phone,
                socialLinks: user.socialLinks
            }
        };
    }

    // Login user
    async loginUser({ email, password }) {
        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        return {
            success: true,
            token: this.generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        };
    }

    // Get current user
    async getCurrentUser(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        return {
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        };
    }
}

module.exports = new AuthService();

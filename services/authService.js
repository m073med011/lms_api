const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');


class AuthService {
    // Generate JWT Token
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
    }

    // Register new user
    async registerUser({ name, email, password, role }) {
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
            role
        });

        return {
            success: true,
            token: this.generateToken(user._id),
            user: {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
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
                role: user.role,
            }
        };
    }
    // Update user with encrypted password
    async updateUser(userId, updateData) {
        // Check if password is provided and hash it
        if (updateData.password) {
            const saltRounds = 10; // You can adjust the number of salt rounds
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return {
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    }
    // Delete user
    async deleteUser(userId) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return {
            success: true,
            message: 'User deleted successfully',
        };
    }

    // Get All users for Admin Only
    async getAllUsers() {
        try {
            const users = await User.find();
            return {
                success: true,
                users,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

}

module.exports = new AuthService();

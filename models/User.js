// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        // Make password conditional - required only if not OAuth user
        required: function() {
            return !this.isOAuthUser;
        },
        select: false,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'freelancer', 'admin', 'organizer', 'instructor', 'user'],
        default: 'student'
    },
    // Add field to track OAuth users
    isOAuthUser: {
        type: Boolean,
        default: false
    },
    // Store OAuth provider info
    provider: {
        type: String,
        enum: ['google', 'credentials'],
        default: 'credentials'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

// Encrypt password using bcrypt - only if password exists
userSchema.pre('save', async function(next) {
    // Skip if password is not modified or doesn't exist (OAuth users)
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Return false if user doesn't have a password (OAuth user)
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
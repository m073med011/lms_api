const express = require('express');
const router = express.Router();
const { register, login, getMe, GetAllUsers, updateMe,deleteMe,getUserByEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);
router.get('/user/:email',getUserByEmail);


// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me/:userId', protect, getMe);
router.put('/me/:userId', updateMe);
router.delete('/me/:userId', deleteMe);


// @route   GET /api/auth/users/all
// @desc    Get All User
// @access  Admin only
router.get('/all', GetAllUsers)

module.exports = router;

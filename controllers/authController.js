const authService = require('../services/authService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password,role} = req.body;
        const result = await authService.registerUser({ 
            name, 
            email, 
            password, 
            role,
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
exports.updateMe = async (req, res) => {
  try {
    const result = await authService.updateUser(req.params.userId, req.body);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server error' });
  }
};
exports.deleteMe = async (req, res) => {
  try {
    const result = await authService.deleteUser(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server error' });
  }
};
exports.GetAllUsers = async (req, res) => {
  try {
    // Call the authService.getAllUsers method to fetch all users
    const result = await authService.getAllUsers();  // Notice the parentheses to call the method

    // Check if the result is successful
    if (result.success) {
      return res.status(200).json({
        success: true,
        users: result.users,  // Send the users in the response
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Could not retrieve users",
      });
    }
  } catch (error) {
    // Handle any errors that might occur
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",  // Generic server error message
    });
  }
};

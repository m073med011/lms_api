const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const courseController = require('../controllers/courseController');
const upload = require('../middleware/upload');

// Public routes
// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', courseController.listCourses);

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', courseController.getCourse);

// Protected routes that require authentication


// Student routes
// @route   GET /api/courses/student/my-courses
// @desc    Get student's enrolled courses
// @access  Private (Student)
router.get('/:studentid/my-courses', courseController.getStudentCourses);

// @route   POST /api/courses/:id/buy
// @desc    Buy a course
// @access  Private (Student)
router.post('/:courseid/buy/:userid', courseController.buyCourse);

// Instructor routes
// @route   GET /api/courses/instructor/courses
// @desc    Get instructor's courses
// @access  Private (Instructor)
router.get('/instructor/courses', courseController.getInstructorCourses);

// @route   POST /api/courses/create
// @desc    Upload a thumbnail and create a course
// @access  Private (Instructor)
router.post('/create', 
    protect,
    upload.single('thumbnail'),
    courseController.createCourse
);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Instructor)
router.put('/:id', courseController.updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Instructor)
router.delete('/:id', courseController.deleteCourse);

// Course materials routes
// @route   POST /api/courses/:id/materials
// @desc    Add material to course
// @access  Private (Instructor)
router.post('/:id/materials', courseController.addMaterial);

// @route   DELETE /api/courses/:id/materials/:materialId
// @desc    Delete material from course
// @access  Private (Instructor)
router.delete('/:id/materials/:materialId', courseController.deleteMaterial);

module.exports = router;

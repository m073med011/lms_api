const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const courseController = require('../controllers/courseController');
const upload = require('../middleware/upload');
// import { authenticate } from '../middleware/authenticate';
const authenticate = require('../middleware/authenticate');


// Public routes
// get All Courses
router.get('/', courseController.listCourses);
// get Single Course

// Student routes
router.get('/mycourses',authenticate, courseController.getStudentCourses);
router.get('/:id', courseController.getCourse);

// Instructor routes
router.get('/instructor/courses', protect, restrictTo('instructor'), courseController.getInstructorCourses);
router.post('/create',authenticate, courseController.createCourse);
router.put('/:id', protect, restrictTo('instructor'), courseController.updateCourse);
router.delete('/:id', protect, restrictTo('instructor'), courseController.deleteCourse);
router.post('/:id/materials', protect, restrictTo('instructor'), courseController.addMaterial);
router.delete('/:id/materials/:materialId', protect, restrictTo('instructor'), courseController.deleteMaterial);

module.exports = router;
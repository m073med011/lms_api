const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const courseController = require('../controllers/courseController');
const upload = require('../middleware/upload');

// Public routes
router.get('/', courseController.listCourses);
router.get('/:id', courseController.getCourse);

// Student routes
router.get('/:studentid/my-courses', courseController.getStudentCourses);
router.post('/:courseid/buy/:userid', protect, restrictTo('student'), courseController.buyCourse);

// Instructor routes
router.get('/instructor/courses', protect, restrictTo('instructor'), courseController.getInstructorCourses);
router.post('/create', protect, restrictTo('instructor'), upload.single('thumbnail'), courseController.createCourse);
router.put('/:id', protect, restrictTo('instructor'), courseController.updateCourse);
router.delete('/:id', protect, restrictTo('instructor'), courseController.deleteCourse);
router.post('/:id/materials', protect, restrictTo('instructor'), courseController.addMaterial);
router.delete('/:id/materials/:materialId', protect, restrictTo('instructor'), courseController.deleteMaterial);

module.exports = router;
const courseService = require('../services/courseService');
const Course = require('../models/Course');
const User = require('../models/User');

class CourseController {
    async createCourse(req, res) {
        console.log('Creating course with data:', req.headers.authorization);
    const instructorId = req.user.id; // from decoded token
        try {
            const courseData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                price: req.body.price,
                duration: req.body.duration,
                level: req.body.level,
                isPublished: req.body.isPublished,
                thumbnail: req.body.thumbnail || "", // optional
                instructor: instructorId
            };
    
            const course = new Course(courseData);
            const savedCourse = await course.save();
    
            res.status(201).json({
                success: true,
                status: 'success',
                message: 'Course created successfully',
                course: savedCourse
            });
        } catch (error) {
            console.error('Error in createCourse controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error creating course'
            });
        }
    }
    

    async getCourse(req, res) {
        try {
            console.log('Getting course with id:', req.params.id);
            const course = await courseService.getCourse(req.params.id);
            if (!course) {
                console.log('Course not found');
                return res.status(404).json({ 
                    success: false,
                    status: 'error',
                    message: 'Course not found' 
                });
            }
            console.log('Course retrieved successfully');
            res.json({
                success: true,
                status: 'success',
                course: course
            });
        } catch (error) {
            console.error('Error in getCourse controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error getting course'
            });
        }
    }

    async updateCourse(req, res) {
        try {
            console.log('Updating course with id:', req.params.id);
            const course = await courseService.updateCourse(req.params.id, req.body);
            if (!course) {
                console.log('Course not found');
                return res.status(404).json({ 
                    success: false,
                    status: 'error',
                    message: 'Course not found' 
                });
            }
            console.log('Course updated successfully');
            res.json({
                success: true,
                status: 'success',
                course: course
            });
        } catch (error) {
            console.error('Error in updateCourse controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error updating course'
            });
        }
    }

    async deleteCourse(req, res) {
        try {
            console.log('Deleting course with id:', req.params.id);
            const course = await courseService.deleteCourse(req.params.id);
            if (!course) {
                console.log('Course not found');
                return res.status(404).json({ 
                    success: false,
                    status: 'error',
                    message: 'Course not found' 
                });
            }
            console.log('Course deleted successfully');
            res.json({
                success: true,
                status: 'success',
                message: 'Course deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteCourse controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error deleting course'
            });
        }
    }

    async addMaterial(req, res) {
        try {
            console.log('Adding material to course with id:', req.params.id);
            const course = await courseService.addMaterial(req.params.id, req.body);
            console.log('Material added successfully');
            res.json({
                success: true,
                status: 'success',
                course: course
            });
        } catch (error) {
            console.error('Error in addMaterial controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error adding material'
            });
        }
    }

    async deleteMaterial(req, res) {
        try {
            console.log('Deleting material from course with id:', req.params.id);
            const course = await courseService.deleteMaterial(req.params.id, req.params.materialId);
            if (!course) {
                console.log('Course or material not found');
                return res.status(404).json({ 
                    success: false,
                    status: 'error',
                    message: 'Course or material not found' 
                });
            }
            console.log('Material deleted successfully');
            res.json({
                success: true,
                status: 'success',
                course: course
            });
        } catch (error) {
            console.error('Error in deleteMaterial controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error deleting material'
            });
        }
    }
  // courseController.js
async listCourses(req, res) {
    try {
        // console.log('Listing courses with filters and pagination:', req.query);

        // Get page and limit from query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Pass filters, page, and limit to the service method
        const data = await courseService.listCourses(req.query, page, limit);

        // console.log('Courses listed successfully');
        res.json({
            success: true,
            status: 'success',
            ...data // Spread courses, total, page, and pages
        });
    } catch (error) {
        console.error('Error in listCourses controller:', error);
        res.status(400).json({ 
            success: false,
            status: 'error',
            message: error.message || 'Error listing courses'
        });
    }
}




    async getStudentCourses(req, res) {
        
        try {
            console.log(req.user.id);
            const courses = await courseService.getStudentCourses(req.user.id);
            res.json({
                success: true,
                status: 'success',
                courses: courses
            });
        } catch (error) {
            console.error('Error in getStudentCourses controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error getting courses for student'
            });
        }
    }

    async getInstructorCourses(req, res) {
        try {
            console.log('Getting courses for instructor with id:', req.user.id);
            const courses = await courseService.getInstructorCourses(req.user.id);
            console.log('Courses retrieved successfully');
            res.json({
                success: true,
                status: 'success',
                courses: courses
            });
        } catch (error) {
            console.error('Error in getInstructorCourses controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error getting courses for instructor'
            });
        }
    }

    
}

module.exports = new CourseController();

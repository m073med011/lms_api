const courseService = require('../services/courseService');
const Course = require('../models/Course');

class CourseController {
    async createCourse(req, res) {
        try {
            const thumbnailFile = req.file;
            if (!thumbnailFile) {
                return res.status(400).json({ 
                    success: false,
                    status: 'error',
                    message: 'No file uploaded' 
                });
            }

            console.log('Thumbnail file received:', thumbnailFile.originalname);

            // Upload file to Cloudinary
            const thumbnailUrl = await courseService.uploadThumbnail(thumbnailFile);
            console.log('Thumbnail URL received:', thumbnailUrl);

            // Create new course with the Cloudinary URL
            const courseData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                price: req.body.price,
                duration: req.body.duration,
                level: req.body.level,
                isPublished: req.body.isPublished,
                thumbnail: thumbnailUrl,
                instructor: req.user.id
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
    async listCourses(req, res) {
        try {
            console.log('Listing courses');
            const courses = await courseService.listCourses(req.query);
            console.log('Courses listed successfully');
            res.json({
                success: true,
                status: 'success',
                courses: courses
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
            console.log('Getting courses for student with id:', req.user.id);
            const courses = await courseService.getStudentCourses(req.user.id);
            console.log('Courses retrieved successfully');
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

    async buyCourse(req, res) {
        try {
            console.log('Buying course with id:', req.params.id);
            const course = await courseService.buyCourse(req.params.id, req.user.id);
            console.log('Course purchased successfully');
            res.json({
                success: true,
                status: 'success',
                message: 'Course purchased successfully',
                course: course
            });
        } catch (error) {
            console.error('Error in buyCourse controller:', error);
            res.status(400).json({ 
                success: false,
                status: 'error',
                message: error.message || 'Error buying course'
            });
        }
    }
}

module.exports = new CourseController();

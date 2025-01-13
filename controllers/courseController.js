const courseService = require('../services/courseService');

class CourseController {
    async createCourse(req, res) {
        try {
            const course = await courseService.createCourse(req.body, req.user.id);
            res.status(201).json(course);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getCourse(req, res) {
        try {
            const course = await courseService.getCourse(req.params.id);
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateCourse(req, res) {
        try {
            const course = await courseService.updateCourse(req.params.id, req.body);
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteCourse(req, res) {
        try {
            const course = await courseService.deleteCourse(req.params.id);
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.json({ message: 'Course deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async addMaterial(req, res) {
        try {
            const course = await courseService.addMaterial(req.params.id, req.body);
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteMaterial(req, res) {
        try {
            const course = await courseService.deleteMaterial(req.params.id, req.params.materialId);
            if (!course) return res.status(404).json({ message: 'Course or material not found' });
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async enrollStudent(req, res) {
        try {
            const course = await courseService.enrollStudent(req.params.id, req.user.id);
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async unenrollStudent(req, res) {
        try {
            const course = await courseService.unenrollStudent(req.params.id, req.user.id);
            res.json(course);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async listCourses(req, res) {
        try {
            const courses = await courseService.listCourses(req.query);
            res.json(courses);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getStudentCourses(req, res) {
        try {
            const courses = await courseService.getStudentCourses(req.user.id);
            res.json(courses);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getInstructorCourses(req, res) {
        try {
            const courses = await courseService.getInstructorCourses(req.user.id);
            res.json(courses);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async buyCourse(req, res) {
        try {
            const course = await courseService.buyCourse(req.params.id, req.user.id);
            res.json({ 
                message: 'Course purchased successfully',
                course 
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new CourseController();

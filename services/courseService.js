const Course = require('../models/Course');

class CourseService {
    async createCourse(courseData, instructorId) {
        const course = new Course({
            ...courseData,
            instructor: instructorId
        });
        return await course.save();
    }

    async getCourse(courseId) {
        return await Course.findById(courseId)
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email');
    }

    async updateCourse(courseId, courseData) {
        return await Course.findByIdAndUpdate(
            courseId,
            { $set: courseData },
            { new: true }
        );
    }

    async deleteCourse(courseId) {
        return await Course.findByIdAndDelete(courseId);
    }

    async addMaterial(courseId, materialData) {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        
        materialData.order = course.materials.length + 1;
        course.materials.push(materialData);
        return await course.save();
    }

    async deleteMaterial(courseId, materialId) {
        return await Course.findByIdAndUpdate(
            courseId,
            { $pull: { materials: { _id: materialId } } },
            { new: true }
        );
    }

    async listCourses(filters = {}) {
        return await Course.find(filters)
            .populate('instructor', 'name email')
            .sort('-createdAt');
    }

    async getStudentCourses(studentId) {
        return await Course.find({ enrolledStudents: studentId })
            .populate('instructor', 'name email');
    }

    async getInstructorCourses(instructorId) {
        return await Course.find({ instructor: instructorId })
            .populate('enrolledStudents', 'name email');
    }

    async buyCourse(courseId, studentId) {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');
        
        if (course.enrolledStudents.includes(studentId)) {
            throw new Error('Student already enrolled in this course');
        }

        // Initialize arrays if they don't exist
        if (!course.enrolledStudents) course.enrolledStudents = [];
        if (!course.purchases) course.purchases = [];

        // Add student to enrolled students
        course.enrolledStudents.push(studentId);
        
        // Add purchase record
        course.purchases.push({
            student: studentId,
            purchaseDate: new Date(),
            amount: course.price
        });

        const updatedCourse = await course.save();
        return await Course.findById(updatedCourse._id)
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email');
    }
}

module.exports = new CourseService();

const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

class CourseService {
    uploadThumbnail(file) {
        return new Promise((resolve, reject) => {
            console.log('Starting thumbnail upload to Cloudinary...');
            
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'course-thumbnails',
                    resource_type: 'auto',
                    chunk_size: 20000000, // 20MB chunks
                    timeout: 120000, // 2 minutes timeout
                    transformation: [
                        { quality: 'auto:good' }, // Automatic quality optimization
                        { fetch_format: 'auto' }  // Automatic format selection
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error('Failed to upload thumbnail: ' + error.message));
                        return;
                    }
                    console.log('Thumbnail uploaded successfully:', result.secure_url);
                    resolve(result.secure_url);
                }
            );

            // Handle stream errors
            stream.on('error', (error) => {
                console.error('Stream error:', error);
                reject(new Error('Stream error while uploading thumbnail'));
            });

            // Handle stream progress
            let uploadedBytes = 0;
            stream.on('data', (data) => {
                uploadedBytes += data.length;
                console.log(`Upload progress: ${uploadedBytes} bytes uploaded`);
            });

            const buffer = Readable.from(file.buffer);
            buffer.pipe(stream);
        });
    }

    async createCourse(courseData, instructorId, thumbnailFile) {
        try {
            let thumbnailUrl;
            
            if (thumbnailFile) {
                console.log('Thumbnail file detected, starting upload process...', {
                    filename: thumbnailFile.originalname,
                    size: thumbnailFile.size,
                    mimetype: thumbnailFile.mimetype
                });
                try {
                    thumbnailUrl = await this.uploadThumbnail(thumbnailFile);
                    console.log('Thumbnail URL received:', thumbnailUrl);
                } catch (error) {
                    console.error('Error uploading thumbnail:', error);
                    throw new Error('Failed to upload thumbnail: ' + error.message);
                }
            }

            console.log('Creating course with data:', { ...courseData, instructor: instructorId });
            const course = new Course({
                ...courseData,
                instructor: instructorId,
                thumbnail: thumbnailUrl || courseData.thumbnail
            });
            
            const savedCourse = await course.save();
            console.log('Course created successfully:', savedCourse._id);
            return savedCourse;
        } catch (error) {
            console.error('Error in createCourse:', error);
            if (error.name === 'ValidationError') {
                throw new Error('Invalid course data: ' + Object.values(error.errors).map(err => err.message).join(', '));
            }
            throw error;
        }
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

  // courseService.js
async listCourses(filters = {}, page = 1, limit = 10) {
    // Initialize query object
    const query = {};

    // Apply filters
    if (filters.category && filters.category !== '') {
        query.category = filters.category;
    }
    if (filters.level && filters.level !== '') {
        query.level = filters.level;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of documents matching the query
    const total = await Course.countDocuments(query);

    // Fetch courses with pagination and filters
    const courses = await Course.find(query)
        .populate('instructor', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    // Return both courses and total count
    return {
        courses,
        total,
        page,
        pages: Math.ceil(total / limit) // Calculate total pages
    };
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

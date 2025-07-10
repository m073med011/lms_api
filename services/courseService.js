const Course = require('../models/Course');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const PaymobService = require('./paymobService');


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
            // .populate('enrolledStudents', 'name email');
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
    const query = {};

    // 🔎 Text Search (title, maybe description)
    if (filters.search && filters.search.trim() !== '') {
        const regex = new RegExp(filters.search.trim(), 'i'); // case-insensitive
        query.$or = [
            { title: regex },
            { level: regex } // optional
        ];
    }

    // ✅ Filter by category
    if (filters.category && filters.category !== '') {
        query.category = filters.category;
    }

    // ✅ Filter by level
    if (filters.level && filters.level !== '') {
        query.level = filters.level;
    }

    // 📄 Pagination
    const skip = (page - 1) * limit;
    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
        .populate('instructor', 'name email')
        .select('-materials -description') // remove if needed
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    return {
        courses,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
}


async  getStudentCourses(studentId) {
  const purchases = await Purchase.find({
    user: studentId,
    status: { $in: ["Paid", "Pending"] } // include both statuses
  }).populate({
    path: "course",
            select: "-materials -description -price -isPublished -slug",
    populate: {
      path: "instructor",
      select: "name email"
    }
  });

  // Extract only valid course documents
  const courses = purchases
    .map(p => p.course)
    .filter(course => course !== null); // filter out deleted courses

  return courses;
}


    async getInstructorCourses(instructorId) {
        return await Course.find({ instructor: instructorId })
            .populate('enrolledStudents', 'name email');
    }

}

module.exports = new CourseService();

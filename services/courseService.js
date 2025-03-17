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
        console.log('buyCourse service called:', { courseId, studentId });
      
        // Check course
        const course = await Course.findById(courseId);
        if (!course) {
          console.log('Course not found:', courseId);
          throw new Error('Course not found');
        }
        console.log('Course found:', course.title);
      
        // Check user
        const user = await User.findById(studentId);
        if (!user) {
          console.log('User not found:', studentId);
          throw new Error('User not found');
        }
        console.log('User found:', user.email);
      
        // Check if already purchased
        const alreadyPurchased = await this.isCoursePurchased(studentId, courseId);
        if (alreadyPurchased) {
          console.log('Course already purchased:', { courseId, studentId });
          throw new Error('You have already purchased this course');
        }
      
        // Paymob integration
        let authToken, orderId, paymentToken, paymentURL, purchase;
        try {
          console.log('Authenticating with Paymob...');
          authToken = await PaymobService.getAuthToken();
          console.log('Paymob auth token:', authToken);
      
          console.log('Creating Paymob order...');
          orderId = await PaymobService.createOrder(course.price, authToken);
          console.log('Paymob order ID:', orderId);
      
          purchase = await Purchase.create({
            user: studentId,
            course: courseId,
            transactionId: orderId,
            amount: course.price,
            status: 'Pending',
          });
          console.log('Purchase created:', purchase._id);
      
          // Define userData for Paymob billing
          const userData = {
            email: user.email || 'test@example.com',
            firstName: user.name ? user.name.split(' ')[0] : 'N/A',
            lastName: user.name ? user.name.split(' ')[1] || 'N/A' : 'N/A',
            phone: user.phone || '+201234567890', // Add a phone field to your User model if needed
            amount: course.price,
          };
          console.log('User data for Paymob:', userData);
      
          console.log('Getting Paymob payment token...');
          paymentToken = await PaymobService.getPaymentToken(orderId, authToken, userData);
          console.log('Paymob payment token:', paymentToken);
      
          paymentURL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
          console.log('Payment URL generated:', paymentURL);
      
          return { paymentURL, purchaseId: purchase._id };
        } catch (error) {
          console.error('Paymob integration error:', error.message, error.response?.data);
          throw new Error(`Paymob integration failed: ${error.message}`);
        }
      }
    
      async confirmCoursePurchase(orderId, transactionId, success) {
        const purchase = await Purchase.findOne({ transactionId: orderId });
        if (!purchase) throw new Error('Purchase record not found');
    
        purchase.status = success ? 'Paid' : 'Failed';
        await purchase.save();
    
        if (success) {
          // Update User and Course
          await User.findByIdAndUpdate(purchase.user, {
            $addToSet: { purchasedCourses: purchase.course },
          });
          await Course.findByIdAndUpdate(purchase.course, {
            $addToSet: { enrolledStudents: purchase.user },
            $push: { purchases: { student: purchase.user, amount: purchase.amount } },
          });
        }
    
        return { message: 'Purchase confirmed successfully' };
      }
    
      async isCoursePurchased(studentId, courseId) {
        const purchase = await Purchase.findOne({
          user: studentId,
          course: courseId,
          status: 'Paid',
        });
        return !!purchase;
      }
}

module.exports = new CourseService();

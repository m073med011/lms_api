const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ['video', 'document', 'quiz'] },
    content: { type: String, required: true }, // URL for video/document, or JSON for quiz
    order: { type: Number, required: true }
}, { timestamps: true });

const purchaseSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    purchaseDate: { type: Date, default: Date.now },
    amount: { type: Number, required: true }
}, { timestamps: true });


const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A course must have a title'],
        trim: true,
        maxlength: [100, 'A course title must have less than or equal to 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    thumbnail: { type: String, default: 'https://placehold.co/600x400' },
    description: {
        type: String,
        required: [true, 'A course must have a description'],
        trim: true
    },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    materials: [materialSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    purchases: [purchaseSchema],
    category: {
        type: String,
        required: [true, 'A course must have a category']
    },
    duration: {
        type: Number,
        required: [true, 'A course must have a duration']
    },
    level: {
        type: String,
        required: [true, 'A course must have a level'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    price: {
        type: Number,
        required: [true, 'A course must have a price'],
        min: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate slug from title before saving
courseSchema.pre('save', function(next) {
    this.slug = this.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-') // Replace multiple - with single -
        + '-' + Date.now(); // Add timestamp to make it unique
    next();
});

module.exports = mongoose.model('Course', courseSchema);

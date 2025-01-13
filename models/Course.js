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
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    materials: [materialSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    purchases: [purchaseSchema],
    category: { type: String, required: true },
    duration: { type: Number }, // in hours
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    price: { type: Number, required: true, min: 0 },
    isPublished: { type: Boolean, default: false },
    image: { type: String, default: 'https://placehold.co/600x400' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

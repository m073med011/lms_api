// models/Purchase.js
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  amount: { type: Number, required: true },
  transactionId: { type: String }, // Paymob transaction ID
  createdAt: { type: Date, default: Date.now }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;

const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Purchase", PurchaseSchema);

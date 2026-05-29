const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['income', 'expense'], required: true },
  amount:   { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Food & Dining', 'Transport', 'Utilities', 'Entertainment', 
      'Shopping', 'Health', 'Education', 'Allowance', 'Salary', 'Other'
    ]
  },
  note:     { type: String },
  date:     { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
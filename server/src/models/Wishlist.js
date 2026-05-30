const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  emoji: { type: String, default: '⌚' }
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
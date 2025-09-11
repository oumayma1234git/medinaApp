// models/favorite.js
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  film: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Film',
    required: true
  }
}, {
  timestamps: true,
  // Empêche les doublons user+film
  unique: true 
});

module.exports = mongoose.model('Favorite', favoriteSchema);
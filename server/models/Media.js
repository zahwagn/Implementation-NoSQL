const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['movie', 'book'], required: true },
  status: { 
    type: String, 
    enum: ['watched', 'plan', 'read', 'completed'], 
    required: true 
  },
  imageUrl: { type: String },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5,
    validate: {
      validator: function(v) {
        return this.status === 'watched' || this.status === 'read' || this.status === 'completed';
      },
      message: 'Rating can only be set for watched/read/completed items'
    }
  },
  review: { type: String },
  ageCategory: { 
    type: String, 
    enum: ['all', 'kids', 'teen', 'adult'], 
    default: 'all' 
  },
  suitableFor: { type: String },
  venues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }],
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Media', mediaSchema);
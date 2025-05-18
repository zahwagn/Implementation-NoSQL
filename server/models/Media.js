const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  type: { 
    type: String, 
    enum: ['movie', 'book'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['watched', 'plan', 'read', 'completed'], 
    required: true,
    default: 'plan'
  },
  imageUrl: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || // Allow null/empty
               /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v) || // URL
               /^\/uploads\/[\w\-\.]+$/.test(v); // Local file path
      },
      message: props => `${props.value} is not a valid URL or file path!`
    }
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5,
    validate: {
      validator: function(v) {
        return !v || ['watched', 'read', 'completed'].includes(this.status);
      },
      message: 'Rating can only be set for watched/read/completed items'
    }
  },
  review: { 
    type: String,
    maxlength: 1000
  },
  ageCategory: { 
    type: String, 
    enum: ['all', 'kids', 'teen', 'adult'], 
    required: true,
    default: 'all'
  },
    genres: { 
    type: String, 
    enum: ['comedy', 'rommance', 'action', 'adult', 'horror', 'drama', 'thriller', 'documentary', 'fantasy', 'mystery'], 
    required: true,
    default: 'all'
  },
  duration: { type: Number }, // minutes
  pageCount: { type: Number }, // pages for books
  releaseDate: { type: Date },
  venues: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Venue' 
  }],
  viewCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
mediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Text index for search
mediaSchema.index({ title: 'text', review: 'text' });

module.exports = mongoose.model('Media', mediaSchema);
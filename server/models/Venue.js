const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['cinema', 'bookstore'], required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  // Cinema specific fields
  capacity: { 
    type: Number, 
    required: function() { return this.type === 'cinema'; }
  },
  availableSeats: { 
    type: Number, 
    required: function() { return this.type === 'cinema'; }
  },
  // Bookstore specific field
  bookStock: { 
    type: Number, 
    required: function() { return this.type === 'bookstore'; }
  },
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  createdAt: { type: Date, default: Date.now },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Venue', venueSchema);
const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['cinema', 'bookstore'], required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  price: { type: Number, required: true },
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  createdAt: { type: Date, default: Date.now },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Venue', venueSchema);
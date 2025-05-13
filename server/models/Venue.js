const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['cinema', 'bookstore'], required: true },
  location: { type: String, required: true },
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venue', venueSchema);
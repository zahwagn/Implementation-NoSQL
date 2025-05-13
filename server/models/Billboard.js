const mongoose = require('mongoose');

const billboardSchema = new mongoose.Schema({
  rank: { type: Number, required: true, min: 1, max: 5 },
  media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  viewCount: { type: Number, required: true },
  week: { type: Number, required: true },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Billboard', billboardSchema);
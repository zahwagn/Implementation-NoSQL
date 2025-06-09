const mongoose = require('mongoose');

const billboardSchema = new mongoose.Schema({
  media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  mediaType: { type: String, enum: ['movie', 'book'], required: true },
  totalTickets: { type: Number, required: true, default: 0 },
  week: { type: Number, required: true },
  year: { type: Number, required: true },
  rank: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
});

// Auto-update rank based on totalTickets within the same mediaType
billboardSchema.pre('save', async function(next) {
  if (this.isModified('totalTickets')) {
    const currentWeekBillboards = await this.constructor.find({ 
      week: this.week, 
      year: this.year,
      mediaType: this.mediaType // Rank within the same mediaType
    }).sort({ totalTickets: -1 });
    
    currentWeekBillboards.forEach(async (item, index) => {
      if (item.rank !== index + 1) {
        item.rank = index + 1;
        await item.save();
      }
    });
  }
  next();
});

module.exports = mongoose.model('Billboard', billboardSchema);
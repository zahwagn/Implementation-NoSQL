const Media = require('../models/Media');
const Billboard = require('../models/Billboard');
const Venue = require('../models/Venue');

exports.getAllMedia = async (filters = {}) => {
  return await Media.find(filters).sort({ createdAt: -1 }).populate('venues');
};

exports.getMediaById = async (id) => {
  return await Media.findById(id).populate('venues');
};

exports.createMedia = async (mediaData) => {
  const media = new Media(mediaData);
  return await media.save();
};

exports.updateMedia = async (id, mediaData) => {
  return await Media.findByIdAndUpdate(id, mediaData, { new: true }).populate('venues');
};

exports.deleteMedia = async (id) => {
  return await Media.findByIdAndDelete(id);
};

exports.filterMedia = async (type, filters = {}) => {
  return await Media.find({ type, ...filters }).sort({ createdAt: -1 }).populate('venues');
};

exports.getCurrentBillboard = async () => {
  const currentDate = new Date();
  const week = Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
  const year = currentDate.getFullYear();
  
  return await Billboard.find({ week, year })
    .sort({ rank: 1 })
    .limit(5)
    .populate('media');
};

exports.incrementViewCount = async (id) => {
  return await Media.findByIdAndUpdate(
    id, 
    { $inc: { viewCount: 1 } }, 
    { new: true }
  );
};

exports.addVenueToMedia = async (mediaId, venueId) => {
  return await Media.findByIdAndUpdate(
    mediaId,
    { $addToSet: { venues: venueId } },
    { new: true }
  ).populate('venues');
};

exports.createVenue = async (venueData) => {
  const venue = new Venue(venueData);
  return await venue.save();
};
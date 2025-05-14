const Media = require('../models/Media');
const Billboard = require('../models/Billboard');
const Venue = require('../models/Venue');

exports.countMedia = async () => {
  return await Media.countDocuments();
};

exports.getAllMediaNoFilter = async () => {
  return await Media.find({}).sort({ createdAt: -1 }).populate('venues');
};

exports.getAllMedia = async (filters = {}) => {
  try {
    console.log("Repository filters:", JSON.stringify(filters));
    
    if (filters.ageCategory && filters.ageCategory.$in) {
      console.log("Filtering by age categories:", filters.ageCategory.$in);
    } else if (filters.ageCategory) {
      console.log("Filtering by specific age category:", filters.ageCategory);
    }
    
    const query = Media.find(filters).sort({ createdAt: -1 });
    console.log("Query:", query.getFilter());
    
    const media = await query.populate('venues');
    
    console.log(`Repository found ${media.length} media items`);
    if (media.length > 0) {
      console.log("Sample media:", {
        title: media[0].title,
        type: media[0].type,
        ageCategory: media[0].ageCategory
      });
    }
    
    return media;
  } catch (error) {
    console.error("Error in repository getAllMedia:", error);
    throw error;
  }
};

exports.getMediaById = async (id) => {
  return await Media.findById(id).populate('venues');
};

exports.createMedia = async (mediaData, image = null) => {
  if (image) {
    mediaData.imageUrl = `/uploads/${image.filename}`;
  }
  
  const media = new Media(mediaData);
  return await media.save();
};

exports.updateMedia = async (id, mediaData, image = null) => {
  if (image) {
    mediaData.imageUrl = `/uploads/${image.filename}`;
  }
  
  Object.keys(mediaData).forEach(key => {
    if (mediaData[key] === undefined) {
      delete mediaData[key];
    }
  });
  
  return await Media.findByIdAndUpdate(id, 
    { ...mediaData, updatedAt: Date.now() }, 
    { new: true }
  ).populate('venues');
};

exports.deleteMedia = async (id) => {
  return await Media.findByIdAndDelete(id);
};

exports.filterMedia = async (filters = {}) => {
  let query = {};
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.ageCategory) {
    if (typeof filters.ageCategory === 'object' && filters.ageCategory.$in) {
      query.ageCategory = { $in: filters.ageCategory.$in };
    } else {
      query.ageCategory = filters.ageCategory;
    }
  }
  
  console.log("Filter query:", JSON.stringify(query));
  
  return await Media.find(query)
    .sort({ createdAt: -1 })
    .populate('venues');
};

exports.getCurrentBillboard = async () => {
  const currentDate = new Date();
  const week = Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
  const year = currentDate.getFullYear();
  
  return await Billboard.find({ week, year })
    .sort({ rank: 1 })
    .limit(5)
    .populate({
      path: 'media',
      model: 'Media'
    });
};

exports.incrementViewCount = async (id) => {
  const media = await Media.findByIdAndUpdate(
    id, 
    { $inc: { viewCount: 1 } }, 
    { new: true }
  );
  
  const currentDate = new Date();
  const week = Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
  const year = currentDate.getFullYear();

  await Billboard.findOneAndUpdate(
    { media: id, week, year },
    { 
      $inc: { viewCount: 1 },
      $setOnInsert: { media: id, week, year } 
    },
    { upsert: true, new: true }
  );

  return media;
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
const mediaRepository = require('../repositories/media.repository');
const baseResponse = require('../utils/baseResponse');

exports.getAllMedia = async (req, res) => {
  try {
    // Jika user terautentikasi filter based on categories
    const filters = {};
    if (req.user) {
      filters.ageCategory = { $in: req.user.allowedCategories };
    }
    
    const media = await mediaRepository.getAllMedia(filters);
    return baseResponse(res, true, 200, "Media retrieved successfully", media);
  } catch (error) {
    console.error("Error retrieving media:", error);
    return baseResponse(res, false, 500, "Error retrieving media", error.message);
  }
};

exports.getMediaById = async (req, res) => {
  const id = req.params.id;
  
  try {
    const media = await mediaRepository.getMediaById(id);
    
    if (!media) {
      return baseResponse(res, false, 404, "Media not found", null);
    }
    
    return baseResponse(res, true, 200, "Media retrieved successfully", media);
  } catch (error) {
    console.error("Error retrieving media:", error);
    return baseResponse(res, false, 500, "Error retrieving media", error.message);
  }
};

exports.createMedia = async (req, res) => {
  const { title, type, status, ageCategory, rating, review } = req.body;
  const image = req.file;
  const validCategories = ['all', 'kids', 'teen', 'adult'];
  
  // Validate required fields
  if (!title || !type || !status) {
    return baseResponse(res, false, 400, "Title, type, and status are required", null);
  }
  
  // Validate media type
  if (type !== 'movie' && type !== 'book') {
    return baseResponse(res, false, 400, "Type must be either 'movie' or 'book'", null);
  }
  
  // Validate status
  if (status !== 'watched' && status !== 'plan' && status !== 'read') {
    return baseResponse(res, false, 400, "Status must be 'watched', 'read', or 'plan'", null);
  }
  
  // Validate rating if for develop
  if (rating && (rating < 1 || rating > 5)) {
    return baseResponse(res, false, 400, "Rating must be between 1 and 5", null);
  }
  
  // Validate age
  if (!ageCategory || !validCategories.includes(ageCategory)) {
    return baseResponse(res, false, 400, "Valid age category is required (all, kids, teen, adult)");
  }
  try {
    const media = await mediaRepository.createMedia({
      title,
      type,
      status,
      ageCategory, 
      rating: rating || null,
      review: review || null
    }, image);
    
    return baseResponse(res, true, 201, "Media created successfully", media);
  } catch (error) {
    console.error("Error creating media:", error);
    return baseResponse(res, false, 500, "Error creating media", error.message);
  }
};

exports.updateMedia = async (req, res) => {
  const id = req.params.id;
  const { title, type, status, rating, review } = req.body;
  const image = req.file;
  
  // Validate media type if provided
  if (type && type !== 'movie' && type !== 'book') {
    return baseResponse(res, false, 400, "Type must be either 'movie' or 'book'", null);
  }
  
  // Validate status if provided
  if (status && status !== 'watched' && status !== 'plan' && status !== 'read') {
    return baseResponse(res, false, 400, "Status must be 'watched', 'read', or 'plan'", null);
  }
  
  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    return baseResponse(res, false, 400, "Rating must be between 1 and 5", null);
  }
  
  try {
    const media = await mediaRepository.updateMedia(id, {
      title,
      type,
      status,
      rating,
      review
    }, image);
    
    return baseResponse(res, true, 200, "Media updated successfully", media);
  } catch (error) {
    if (error.message === "Media not found") {
      return baseResponse(res, false, 404, "Media not found", null);
    }
    
    console.error("Error updating media:", error);
    return baseResponse(res, false, 500, "Error updating media", error.message);
  }
};

exports.deleteMedia = async (req, res) => {
  const id = req.params.id;
  
  try {
    const media = await mediaRepository.deleteMedia(id);
    return baseResponse(res, true, 200, "Media deleted successfully", media);
  } catch (error) {
    if (error.message === "Media not found") {
      return baseResponse(res, false, 404, "Media not found", null);
    }
    
    console.error("Error deleting media:", error);
    return baseResponse(res, false, 500, "Error deleting media", error.message);
  }
};

exports.filterMedia = async (req, res) => {
  const type = req.params.type;
  const { ageCategory } = req.query;
  
  try {
    // Validasi tipe media
    if (type !== 'movie' && type !== 'book') {
      return baseResponse(res, false, 400, "Type must be either 'movie' or 'book'");
    }
    
    // Filter berdasarkan kategori usia jika user terautentikasi
    const filters = { type };
    if (req.user) {
      if (ageCategory && !req.user.allowedCategories.includes(ageCategory)) {
        return baseResponse(
          res, 
          false, 
          403, 
          `Your age group (${req.user.age}) doesn't have access to this category`
        );
      }
      filters.ageCategory = { $in: req.user.allowedCategories };
    }
    
    const media = await mediaRepository.filterMedia(filters);
    return baseResponse(res, true, 200, `${type}s retrieved successfully`, media);
  } catch (error) {
    console.error(`Error retrieving ${type}s:`, error);
    return baseResponse(res, false, 500, `Error retrieving ${type}s`, error.message);
  }
};

exports.getCurrentBillboard = async (req, res) => {
  try {
    const billboard = await mediaRepository.getCurrentBillboard();
    return baseResponse(res, true, 200, "Billboard retrieved successfully", billboard);
  } catch (error) {
    console.error("Error retrieving billboard:", error);
    return baseResponse(res, false, 500, "Error retrieving billboard", error.message);
  }
};

exports.incrementViewCount = async (req, res) => {
  const id = req.params.id;
  
  try {
    const media = await mediaRepository.incrementViewCount(id);
    return baseResponse(res, true, 200, "View count incremented", media);
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return baseResponse(res, false, 500, "Error incrementing view count", error.message);
  }
};

exports.addVenue = async (req, res) => {
  const { mediaId, venueData } = req.body;
  
  try {
    const venue = await mediaRepository.createVenue(venueData);
    
    const media = await mediaRepository.addVenueToMedia(mediaId, venue._id);
    
    return baseResponse(res, true, 200, "Venue added successfully", { media, venue });
  } catch (error) {
    console.error("Error adding venue:", error);
    return baseResponse(res, false, 500, "Error adding venue", error.message);
  }
};

exports.getMediaByAgeCategory = async (req, res) => {
  const { ageCategory } = req.params;
  
  try {
    const media = await mediaRepository.filterMedia(null, { ageCategory });
    return baseResponse(res, true, 200, "Media retrieved by age category", media);
  } catch (error) {
    console.error("Error retrieving media by age category:", error);
    return baseResponse(res, false, 500, "Error retrieving media", error.message);
  }
};
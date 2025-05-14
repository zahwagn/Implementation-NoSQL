const mediaRepository = require('../repositories/media.repository');
const baseResponse = require('../utils/baseResponse');

exports.getAllMedia = async (req, res) => {
  try {
    const { minRating } = req.query;
    
    console.log("Request user:", req.user);
    
    const totalMediaCount = await mediaRepository.countMedia();
    console.log(`Total media in database: ${totalMediaCount}`);
    
    if (totalMediaCount === 0) {
      return baseResponse(res, true, 200, "Media retrieved successfully (but database is empty)", []);
    }
    
    const filters = {};
    
    // Filter berdasarkan kategori usia yang diizinkan
    if (req.user) {
      if (req.user.allowedCategories && req.user.allowedCategories.length > 0) {
        filters.ageCategory = { $in: req.user.allowedCategories };
        console.log("User has allowed categories:", req.user.allowedCategories);
      } else {
        filters.ageCategory = 'kids';
        console.log("User has no allowed categories, defaulting to kids");
      }
    } else {
      filters.ageCategory = 'kids';
      console.log("No user detected, defaulting to kids category");
    }
    
    if (minRating) {
      filters.rating = { $gte: parseInt(minRating) };
    }
    
    console.log("Applying filters:", JSON.stringify(filters));
    
    const media = await mediaRepository.getAllMedia(filters);
    console.log(`Retrieved ${media.length} media items after filtering`);
    
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
    
    // Cek apakah user memiliki akses ke kategori usia media
    if (req.user) {
      if (!req.user.allowedCategories || !req.user.allowedCategories.includes(media.ageCategory)) {
        return baseResponse(
          res, 
          false, 
          403, 
          `Access denied for age category ${media.ageCategory}. Your account only has access to: ${req.user.allowedCategories.join(', ')}`
        );
      }
    } else {
      // Guest hanya bisa melihat kids
      if (media.ageCategory !== 'kids') {
        return baseResponse(
          res, 
          false, 
          403, 
          `Access denied. Guest accounts can only access media with 'kids' category`
        );
      }
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
  
  // Validasi field yang diperlukan
  if (!title || !type || !status) {
    return baseResponse(res, false, 400, "Title, type, and status are required", null);
  }
  
  // Validasi tipe media
  if (type !== 'movie' && type !== 'book') {
    return baseResponse(res, false, 400, "Type must be either 'movie' or 'book'", null);
  }
  
  // Validasi status
  if (status === 'watched' || status === 'read' || status === 'completed') {
    if (!rating) {
      return baseResponse(res, false, 400, "Rating is required for watched/read/completed items");
    }
  }
  
  // Validasi rating
  if (rating && (rating < 1 || rating > 5)) {
    return baseResponse(res, false, 400, "Rating must be between 1 and 5", null);
  }
  
  // Validasi kategori usia
  if (!ageCategory || !validCategories.includes(ageCategory)) {
    return baseResponse(res, false, 400, "Valid age category is required (all, kids, teen, adult)");
  }
  
  // Validasi akses kategori usia berdasarkan user
  if (!req.user || !req.user.allowedCategories || !req.user.allowedCategories.includes(ageCategory)) {
    return baseResponse(
      res,
      false,
      403,
      `Access denied. Your age group doesn't allow you to create media with category ${ageCategory}`
    );
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
  const { title, type, status, ageCategory, rating, review } = req.body;
  const image = req.file;
  
  try {
    const existingMedia = await mediaRepository.getMediaById(id);
    
    if (!existingMedia) {
      return baseResponse(res, false, 404, "Media not found", null);
    }
    
    if (!req.user || !req.user.allowedCategories || !req.user.allowedCategories.includes(existingMedia.ageCategory)) {
      return baseResponse(
        res,
        false,
        403,
        `Access denied. Your age group doesn't allow you to update media with category ${existingMedia.ageCategory}`
      );
    }
    
    if (ageCategory && ageCategory !== existingMedia.ageCategory) {
      if (!req.user.allowedCategories.includes(ageCategory)) {
        return baseResponse(
          res,
          false,
          403,
          `Access denied. Your age group doesn't allow you to set media to category ${ageCategory}`
        );
      }
    }
    
    if (type && type !== 'movie' && type !== 'book') {
      return baseResponse(res, false, 400, "Type must be either 'movie' or 'book'", null);
    }
    
    if ((status === 'watched' || status === 'read' || status === 'completed') && !rating && !existingMedia.rating) {
      return baseResponse(res, false, 400, "Rating is required for watched/read/completed items");
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return baseResponse(res, false, 400, "Rating must be between 1 and 5", null);
    }
    
    const updateData = {
      title,
      type,
      status,
      ageCategory,
      rating,
      review
    };
    
    const media = await mediaRepository.updateMedia(id, updateData, image);
    
    return baseResponse(res, true, 200, "Media updated successfully", media);
  } catch (error) {
    console.error("Error updating media:", error);
    return baseResponse(res, false, 500, "Error updating media", error.message);
  }
};

exports.deleteMedia = async (req, res) => {
  const id = req.params.id;
  
  try {
    const existingMedia = await mediaRepository.getMediaById(id);
    
    if (!existingMedia) {
      return baseResponse(res, false, 404, "Media not found", null);
    }
    
    if (!req.user || !req.user.allowedCategories || !req.user.allowedCategories.includes(existingMedia.ageCategory)) {
      return baseResponse(
        res,
        false,
        403,
        `Access denied. Your age group doesn't allow you to delete media with category ${existingMedia.ageCategory}`
      );
    }
    
    const media = await mediaRepository.deleteMedia(id);
    return baseResponse(res, true, 200, "Media deleted successfully", media);
  } catch (error) {
    console.error("Error deleting media:", error);
    return baseResponse(res, false, 500, "Error deleting media", error.message);
  }
};

exports.filterMedia = async (req, res) => {
  const type = req.params.type;
  const { ageCategory } = req.query;
  
  try {
    if (type !== 'movie' && type !== 'book') {
      return baseResponse(res, false, 400, "Type must be either 'movie' or 'book'");
    }
    
    // Filter berdasarkan tipe dan kategori usia yang diizinkan
    const filters = { type };
    
    if (req.user) {
      if (ageCategory) {
        if (!req.user.allowedCategories || !req.user.allowedCategories.includes(ageCategory)) {
          return baseResponse(
            res, 
            false, 
            403, 
            `Access denied. Your age group doesn't have access to ${ageCategory} category. You only have access to: ${req.user.allowedCategories.join(', ')}`
          );
        }
        filters.ageCategory = ageCategory;
      } else {
        filters.ageCategory = { $in: req.user.allowedCategories || ['kids'] };
      }
    } else {
      filters.ageCategory = 'kids';
    }
    
    console.log("Filtering media with:", JSON.stringify(filters));
    
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
    
    if (billboard && billboard.length > 0) {
      let filteredBillboard;
      
      if (req.user && req.user.allowedCategories) {
        filteredBillboard = billboard.filter(item => 
          item.media && req.user.allowedCategories.includes(item.media.ageCategory)
        );
        console.log(`Filtered billboard from ${billboard.length} to ${filteredBillboard.length} items based on user categories: ${req.user.allowedCategories}`);
      } else {
        filteredBillboard = billboard.filter(item => 
          item.media && item.media.ageCategory === 'kids'
        );
        console.log(`Filtered billboard from ${billboard.length} to ${filteredBillboard.length} items for guest (kids only)`);
      }
      
      return baseResponse(res, true, 200, "Billboard retrieved successfully", filteredBillboard);
    }
    
    return baseResponse(res, true, 200, "Billboard retrieved successfully", []);
  } catch (error) {
    console.error("Error retrieving billboard:", error);
    return baseResponse(res, false, 500, "Error retrieving billboard", error.message);
  }
};

exports.incrementViewCount = async (req, res) => {
  const id = req.params.id;
  
  try {
    const existingMedia = await mediaRepository.getMediaById(id);
    
    if (!existingMedia) {
      return baseResponse(res, false, 404, "Media not found", null);
    }
    
    if (!req.user || !req.user.allowedCategories || !req.user.allowedCategories.includes(existingMedia.ageCategory)) {
      return baseResponse(
        res,
        false,
        403,
        `Access denied. Your age group doesn't have access to media with category ${existingMedia.ageCategory}`
      );
    }
    
    const media = await mediaRepository.incrementViewCount(id);
    return baseResponse(res, true, 200, "View count incremented", media);
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return baseResponse(res, false, 500, "Error incrementing view count", error.message);
  }
};

exports.addVenue = async (req, res) => {
  const mediaId = req.params.id; 
  const venueData = {
    name: req.body.name,
    type: req.body.type,
    location: req.body.location
  };
  
  try {
    const existingMedia = await mediaRepository.getMediaById(mediaId);
    
    if (!existingMedia) {
      return baseResponse(res, false, 404, "Media not found", null);
    }
    
    if (!req.user || !req.user.allowedCategories || !req.user.allowedCategories.includes(existingMedia.ageCategory)) {
      return baseResponse(
        res,
        false,
        403,
        `Access denied. Your age group doesn't allow you to add venues to media with category ${existingMedia.ageCategory}`
      );
    }
    
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
    const validCategories = ['all', 'kids', 'teen', 'adult'];
    if (!validCategories.includes(ageCategory)) {
      return baseResponse(res, false, 400, "Invalid age category. Must be one of: all, kids, teen, adult");
    }
    
    if (req.user) {
      if (!req.user.allowedCategories || !req.user.allowedCategories.includes(ageCategory)) {
        return baseResponse(
          res, 
          false, 
          403, 
          `Access denied. Your age group doesn't have access to ${ageCategory} category. You only have access to: ${req.user.allowedCategories.join(', ')}`
        );
      }
    } else {
      if (ageCategory !== 'kids') {
        return baseResponse(
          res, 
          false, 
          403, 
          `Access denied. Guest accounts can only access 'kids' category`
        );
      }
    }
    
    const media = await mediaRepository.filterMedia({ ageCategory });
    return baseResponse(res, true, 200, `Media with category '${ageCategory}' retrieved successfully`, media);
  } catch (error) {
    console.error("Error retrieving media by age category:", error);
    return baseResponse(res, false, 500, "Error retrieving media", error.message);
  }
};
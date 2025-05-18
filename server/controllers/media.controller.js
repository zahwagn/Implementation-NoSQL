const mediaRepository = require('../repositories/media.repository');
const baseResponse = require('../utils/baseResponse');

exports.getAllMedia = async (req, res) => {
  try {
    const isGuest = !req.user;
    let filters = {
      minRating: req.query.minRating,
      availableAtVenue: req.query.availableAtVenue === 'true',
      status: req.query.status,
      search: req.query.search,
      sortBy: req.query.sortBy
    };

    // If guest, only show kids content
    if (isGuest) {
      filters.ageCategory = 'kids';
    } 
    // If authenticated user, filter by their allowed categories
    else {
      filters.ageCategories = req.user.allowedCategories;
    }
    
    const media = await mediaRepository.getAllMedia(filters, isGuest);
    return baseResponse(res, true, 200, "Media retrieved successfully", media);
  } catch (error) {
    console.error("Error retrieving media:", error);
    return baseResponse(res, false, 500, "Error retrieving media", error.message);
  }
};

exports.getMediaById = async (req, res) => {
  const id = req.params.id;
  const filters = {
    minRating: req.query.minRating,
    availableAtVenue: req.query.availableAtVenue === 'true'
  };
  
  try {
    const media = await mediaRepository.getMediaById(id, filters);
    
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
  const { 
    title, 
    type, 
    status, 
    ageCategory, 
    rating, 
    review,
    duration,
    genres,
    releaseDate 
  } = req.body;
  
  // Define valid categories
  const validCategories = ['all', 'kids', 'teen', 'adult'];
  
  try {
    // File upload validation
    if (!req.file) {
      return baseResponse(res, false, 400, "Image file is required");
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return baseResponse(res, false, 400, "Only JPG, PNG and WebP images are allowed");
    }

    // Validate required fields
    if (!title || !type || !status) {
      return baseResponse(res, false, 400, "Title, type, and status are required", null);
    }
    
    // Validate media type
    if (type !== 'movie' && type !== 'book') {
      return baseResponse(res, false, 400, "Type must be either 'movie' or 'book'", null);
    }
    
    // Validate status
    if (status === 'watched' || status === 'read' || status === 'completed') {
      if (!rating) {
        return baseResponse(res, false, 400, "Rating is required for watched/read/completed items");
      }
    }
    
    // Validate rating 
    if (rating && (rating < 1 || rating > 5)) {
      return baseResponse(res, false, 400, "Rating must be between 1 and 5", null);
    }
    
    // Validate age category
    if (!ageCategory || !validCategories.includes(ageCategory)) {
      return baseResponse(res, false, 400, "Valid age category is required (all, kids, teen, adult)");
    }

    // Create media data object with all fields
    const mediaData = {
      title: title.trim(),
      type,
      status,
      ageCategory,
      rating: rating || null,
      review: review || null,
      duration: duration ? Number(duration) : null,
      genres: genres || null,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      imageUrl: `/uploads/${req.file.filename}`
    };

    const media = await mediaRepository.createMedia(mediaData);
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
  
  // Validate status
if ((status === 'watched' || status === 'read' || status === 'completed') && !rating) {
  return baseResponse(res, false, 400, "Rating is required for watched/read/completed items");
}
  
  // Validate rating 
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
  const isGuest = !req.user;
  
  try {
    if (type !== 'movie' && type !== 'book') {
      return baseResponse(res, false, 400, "Type must be either 'movie' or 'book'");
    }
    
    const filters = {
      type,
      minRating: req.query.minRating,
      ageCategory: req.query.ageCategory,
      availableAtVenue: req.query.availableAtVenue === 'true',
      status: req.query.status,
      search: req.query.search,
      sortBy: req.query.sortBy
    };
    
    const media = await mediaRepository.filterMedia(filters, isGuest);
    return baseResponse(res, true, 200, `${type}s retrieved successfully`, media);
  } catch (error) {
    console.error(`Error retrieving ${type}s:`, error);
    return baseResponse(res, false, 500, `Error retrieving ${type}s`, error.message);
  }
};

exports.getCurrentBillboard = async (req, res) => {
  try {
    const filters = {
      ageCategory: req.query.ageCategory
    };
    
    const billboard = await mediaRepository.getCurrentBillboard(filters);
    return baseResponse(res, true, 200, "Billboard retrieved successfully", billboard);
  } catch (error) {
    console.error("Error retrieving billboard:", error);
    return baseResponse(res, false, 500, "Error retrieving billboard", error.message);
  }
};

exports.purchaseTicket = async (req, res) => {
  const { mediaId, venueId, quantity } = req.body;
  
  try {
    if (!mediaId || !venueId || !quantity) {
      return baseResponse(res, false, 400, "Media ID, venue ID and quantity are required");
    }
    
    if (quantity < 1) {
      return baseResponse(res, false, 400, "Quantity must be at least 1");
    }
    
    const ticket = await mediaRepository.purchaseTicket(
      req.user.id,
      mediaId,
      venueId,
      quantity
    );
    
    return baseResponse(res, true, 201, "Ticket purchased successfully", ticket);
  } catch (error) {
    console.error("Error purchasing ticket:", error);
    return baseResponse(res, false, 500, "Error purchasing ticket", error.message);
  }
};

exports.addVenue = async (req, res) => {
  const mediaId = req.params.id;
  const { name, type, location, price, capacity, availableSeats } = req.body;
  
  try {
    // Validate required fields
    if (!name || !type || !location || !price || !capacity) {
      return baseResponse(res, false, 400, "Name, type, location, price, and capacity are required");
    }

    // Validate venue type
    if (type !== 'cinema' && type !== 'bookstore') {
      return baseResponse(res, false, 400, "Type must be either 'cinema' or 'bookstore'");
    }

    // Explicit type conversion for numeric fields
    const venueData = {
      name: name.trim(),
      type: type.trim(),
      location: location.trim(),
      price: Number(price),
      capacity: Number(capacity),
      availableSeats: Number(availableSeats || capacity),
      isAvailable: true
    };
    
    // Validate numeric values
    if (isNaN(venueData.price) || venueData.price <= 0) {
      return baseResponse(res, false, 400, "Price must be a positive number");
    }
    
    if (isNaN(venueData.capacity) || venueData.capacity <= 0) {
      return baseResponse(res, false, 400, "Capacity must be a positive number");
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
    const media = await mediaRepository.filterMedia(null, { ageCategory });
    return baseResponse(res, true, 200, "Media retrieved by age category", media);
  } catch (error) {
    console.error("Error retrieving media by age category:", error);
    return baseResponse(res, false, 500, "Error retrieving media", error.message);
  }
};
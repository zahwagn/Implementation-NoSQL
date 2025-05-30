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
    pageCount,
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

    // Create base media data
    const mediaData = {
      title: title.trim(),
      type,
      status,
      ageCategory,
      rating: rating || null,
      review: review || null,
      genres: genres || null,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      imageUrl: `/uploads/${req.file.filename}`
    };

    // Add type-specific fields
    if (type === 'movie') {
      mediaData.duration = duration ? Number(duration) : null;
      mediaData.pageCount = null;
    } else if (type === 'book') {
      mediaData.pageCount = pageCount ? Number(pageCount) : null;
      mediaData.duration = null;
    }

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
      ageCategory: req.query.ageCategory,
      mediaType: req.query.mediaType  // Get mediaType from query
    };
    
    const billboard = await mediaRepository.getCurrentBillboard(filters);
    return baseResponse(res, true, 200, "Billboard retrieved successfully", billboard);
  } catch (error) {
    console.error("Error retrieving billboard:", error);
    return baseResponse(res, false, 500, "Error retrieving billboard", error.message);
  }
};

// Specific controller for movie billboards
exports.getMovieBillboard = async (req, res) => {
  try {
    const filters = {
      ageCategory: req.query.ageCategory,
      mediaType: 'movie'  // Specifically for movies
    };
    
    const billboard = await mediaRepository.getCurrentBillboard(filters);
    
    // Format response to include relevant movie data only
    const formattedBillboard = billboard.map(item => ({
      media: item.media,
      rank: item.rank,
      totalTickets: item.totalTickets,
      totalRevenue: item.totalTickets * (item.media.venues[0]?.price || 0),
      week: item.week,
      year: item.year,
      lastUpdated: item.lastUpdated
    }));
    
    return baseResponse(res, true, 200, "Movie billboard retrieved successfully", formattedBillboard);
  } catch (error) {
    console.error("Error retrieving movie billboard:", error);
    return baseResponse(res, false, 500, "Error retrieving movie billboard", error.message);
  }
};

// Specific controller for book billboards
exports.getBookBillboard = async (req, res) => {
  try {
    const filters = {
      ageCategory: req.query.ageCategory,
      mediaType: 'book'  // Specifically for books
    };
    
    const billboard = await mediaRepository.getCurrentBillboard(filters);
    
    // Format response for books without ticket-related data
    const formattedBillboard = billboard.map(item => ({
      media: item.media,
      rank: item.rank,
      popularity: item.totalTickets, // Rename to popularity instead of tickets for books
      week: item.week,
      year: item.year,
      lastUpdated: item.lastUpdated
    }));
    
    return baseResponse(res, true, 200, "Book billboard retrieved successfully", formattedBillboard);
  } catch (error) {
    console.error("Error retrieving book billboard:", error);
    return baseResponse(res, false, 500, "Error retrieving book billboard", error.message);
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
  const { 
    name, 
    type, 
    location, 
    price, 
    capacity, 
    availableSeats,
    bookStock 
  } = req.body;
  
  try {
    // Basic validation
    if (!name || !type || !location || !price) {
      return baseResponse(res, false, 400, "Name, type, location, and price are required");
    }

    // Validate venue type
    if (type !== 'cinema' && type !== 'bookstore') {
      return baseResponse(res, false, 400, "Type must be either 'cinema' or 'bookstore'");
    }

    // Type-specific validation
    if (type === 'cinema' && (!capacity || capacity < 1)) {
      return baseResponse(res, false, 400, "Capacity is required for cinema venues and must be positive");
    }

    if (type === 'bookstore' && (!bookStock || bookStock < 0)) {
      return baseResponse(res, false, 400, "Book stock is required for bookstore venues and cannot be negative");
    }

    // Create venue data based on type
    const venueData = {
      name: name.trim(),
      type: type.trim(),
      location: location.trim(),
      price: Number(price),
      isAvailable: true
    };

    // Add type-specific fields
    if (type === 'cinema') {
      venueData.capacity = Number(capacity);
      venueData.availableSeats = Number(availableSeats || capacity);
      venueData.bookStock = null;
    } else {
      venueData.bookStock = Number(bookStock);
      venueData.capacity = null;
      venueData.availableSeats = null;
    }
    
    // Validate numeric values
    if (isNaN(venueData.price) || venueData.price <= 0) {
      return baseResponse(res, false, 400, "Price must be a positive number");
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

exports.getBillboardByWeekAndYear = async (req, res) => {
  try {
    const { week, year, mediaType } = req.query;
    
    if (!week || !year) {
      return baseResponse(res, false, 400, "Week and year are required");
    }

    let billboard = await mediaRepository.getBillboardByWeekAndYear(week, year);
    
    // Filter by mediaType if specified
    if (mediaType) {
      billboard = billboard.filter(item => item.mediaType === mediaType);
    }
    
    if (billboard.length === 0) {
      return baseResponse(res, true, 200, "No billboard data found for the specified criteria", []);
    }

    // Format based on media type
    if (mediaType === 'book') {
      // Format response for books
      const formattedBillboard = billboard.map(item => ({
        media: item.media,
        rank: item.rank,
        popularity: item.totalTickets, // Rename to popularity for books
        week: item.week,
        year: item.year,
        lastUpdated: item.lastUpdated
      }));
      return baseResponse(res, true, 200, "Book billboard retrieved successfully", formattedBillboard);
    } else if (mediaType === 'movie') {
      // Format response for movies
      const formattedBillboard = billboard.map(item => ({
        media: item.media,
        rank: item.rank,
        totalTickets: item.totalTickets,
        totalRevenue: item.totalTickets * (item.media.venues[0]?.price || 0),
        week: item.week,
        year: item.year,
        lastUpdated: item.lastUpdated
      }));
      return baseResponse(res, true, 200, "Movie billboard retrieved successfully", formattedBillboard);
    }

    // Default response if no mediaType filter
    return baseResponse(res, true, 200, "Billboard retrieved successfully", billboard);
  } catch (error) {
    console.error("Error retrieving billboard:", error);
    return baseResponse(res, false, 500, "Error retrieving billboard", error.message);
  }
};
const Media = require('../models/Media');
const Billboard = require('../models/Billboard');
const Venue = require('../models/Venue');
const Ticket = require('../models/Ticket');

exports.getAllMedia = async (filters = {}, isGuest = false) => {
  console.log('Filters:', filters);
  console.log('Is Guest:', isGuest);
  
  const query = {};
  
  // Guest can only see kids content
  if (isGuest) {
    query.ageCategory = 'kids';
  } 
  // Authenticated users can see content based on their allowed categories
  else if (filters.ageCategories && filters.ageCategories.length > 0) {
    query.ageCategory = { $in: filters.ageCategories };
  }
  
  // Apply other filters
  if (filters.minRating) {
    query.rating = { $gte: Number(filters.minRating) };
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  // Define sortOptions before using it
  const sortOptions = {};
  if (filters.sortBy) {
    if (filters.sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else if (filters.sortBy === 'rating') {
      sortOptions.rating = -1;
    } else if (filters.sortBy === 'tickets') {  
      sortOptions.totalTickets = -1;
    }
  }
  
  if (filters.availableAtVenue) {
    const availableVenues = await Venue.find({ isAvailable: true });
    if (availableVenues.length > 0) {
      const venueIds = availableVenues.map(venue => venue._id);
      query.venues = { $in: venueIds };
    }
  }
  
  const result = await Media.find(query)
    .sort(sortOptions)
    .populate({
      path: 'venues',
      match: { isAvailable: true }
    });
    
  console.log('Query result:', result);
  return result;
};

exports.getMediaById = async (id, filters = {}) => {
  const query = { _id: id };
  
  if (filters.minRating) {
    query.rating = { $gte: Number(filters.minRating) };
  }
  
  if (filters.availableAtVenue) {
    const venues = await Venue.find({ isAvailable: true }).distinct('media');
    query._id = { $in: venues };
  }
  
  return await Media.findOne(query)
    .populate({
      path: 'venues',
      match: { isAvailable: true }
    });
};

exports.createMedia = async (mediaData) => {
  const media = new Media(mediaData);
  const savedMedia = await media.save();
  
  // Add new media to the current billboard
  await exports.addMediaToBillboard(savedMedia._id, savedMedia.type);
  
  return savedMedia;
};

exports.updateMedia = async (id, mediaData) => {
  const updatedMedia = await Media.findByIdAndUpdate(id, mediaData, { new: true }).populate('venues');
  
  // If the media exists and has a type, update its billboard entry
  if (updatedMedia && updatedMedia.type) {
    try {
      await exports.addMediaToBillboard(updatedMedia._id, updatedMedia.type);
    } catch (error) {
      console.error("Error updating billboard entry:", error);
      // Continue even if billboard update fails
    }
  }
  
  return updatedMedia;
};

exports.deleteMedia = async (id) => {
  return await Media.findByIdAndDelete(id);
};

exports.filterMedia = async (filters = {}, isGuest = false) => {
  const query = {};
  
  // Apply guest restrictions
  if (isGuest) {
    query.ageCategory = 'kids';
  }
  
  // Apply other filters
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.ageCategory) {
    query.ageCategory = filters.ageCategory;
  }
  
  if (filters.minRating) {
    query.rating = { $gte: Number(filters.minRating) };
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.availableAtVenue) {
    const venues = await Venue.find({ isAvailable: true }).distinct('media');
    query._id = { $in: venues };
  }
  
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { review: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  const sortOptions = {};
  if (filters.sortBy) {
    if (filters.sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else if (filters.sortBy === 'rating') {
      sortOptions.rating = -1;
    } else if (filters.sortBy === 'tickets') {  // changed from 'views' to 'tickets'
      sortOptions.totalTickets = -1;
    }
  }
  
  return await Media.find(query)
    .sort(sortOptions)
    .populate({
      path: 'venues',
      match: { isAvailable: true }
    });
};

exports.purchaseTicket = async (userId, mediaId, venueId, quantity) => {
  const venue = await Venue.findById(venueId);
  if (!venue || !venue.isAvailable) {
    throw new Error('Venue is not available');
  }

  // Different validation based on venue type
  if (venue.type === 'cinema') {
    if (venue.availableSeats < quantity) {
      throw new Error('Not enough available seats');
    }
    venue.availableSeats -= quantity;
  } else {
    if (venue.bookStock < quantity) {
      throw new Error('Not enough books in stock');
    }
    venue.bookStock -= quantity;
  }

  // Create ticket/purchase record
  const totalPrice = venue.price * quantity;
  const ticket = new Ticket({
    user: userId,
    media: mediaId,
    venue: venueId,
    quantity,
    totalPrice
  });

  await venue.save();
  await ticket.save();

  // Update media total tickets/sales
  await Media.findByIdAndUpdate(mediaId, {
    $inc: { totalTickets: quantity }
  });

  return ticket;
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
  await venue.save();

  // Add media reference if media ID is provided
  if (venueData.mediaId) {
    await Media.findByIdAndUpdate(
      venueData.mediaId,
      { $addToSet: { venues: venue._id } }
    );
  }
  
  return venue;
};

// Function to add media to billboard
exports.addToBillboard = async (mediaId, mediaType, totalTickets = 0, week, year) => {
  if (!mediaId || !mediaType) {
    throw new Error('Media ID and type are required');
  }
  
  // Use current week/year if not provided
  const currentDate = new Date();
  const currentWeek = week || Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
  const currentYear = year || currentDate.getFullYear();
  
  // Check if media is already on billboard for this week
  const existingEntry = await Billboard.findOne({
    media: mediaId,
    week: currentWeek,
    year: currentYear
  });
  
  if (existingEntry) {
    // Update existing billboard entry
    existingEntry.totalTickets = totalTickets;
    existingEntry.lastUpdated = currentDate;
    await existingEntry.save();
    return existingEntry;
  } else {
    // Create new billboard entry
    const billboardCount = await Billboard.countDocuments({
      week: currentWeek,
      year: currentYear,
      mediaType
    });
    
    const newBillboard = await Billboard.create({
      media: mediaId,
      mediaType,
      totalTickets,
      week: currentWeek,
      year: currentYear,
      rank: billboardCount + 1, // Simple ranking based on current count
      lastUpdated: currentDate
    });
    
    return newBillboard;
  }
};

exports.getCurrentBillboard = async (filters = {}) => {
  console.log("Getting current billboard with filters:", filters);
  
  const currentDate = new Date();
  const week = Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
  const year = currentDate.getFullYear();
  
  // Build the query based on filters
  const query = { 
    week: week,
    year: year
  };
  
  // Add mediaType filter if provided
  if (filters.mediaType && ['movie', 'book'].includes(filters.mediaType)) {
    query.mediaType = filters.mediaType;
    console.log(`Filtering billboard by mediaType: ${filters.mediaType}`);
  }
  
  // Find billboards for current week and year
  let billboards = await Billboard.find(query)
  .populate({
    path: 'media',
    populate: {
      path: 'venues',
      match: { isAvailable: true }
    }
  })
  .sort({ totalTickets: -1 })
  .limit(20); // Increased limit to handle more items
  
  console.log(`Found ${billboards.length} billboard entries for the current week`);
  
  // Filter out entries where media is null (reference to deleted media)
  billboards = billboards.filter(item => item.media != null);
  console.log(`After filtering null media: ${billboards.length} entries`);
  
  // If we have the right media type filter, ensure we only return that type
  if (filters.mediaType) {
    billboards = billboards.filter(item => 
      item.media && item.media.type === filters.mediaType
    );
    console.log(`After filtering by media type: ${billboards.length} entries`);
  }

  // If no billboards exist for current week or the filtered ones are empty
  if (billboards.length === 0) {
    console.log("No billboard entries found, creating new ones from media collection");
    
    // Build media query
    const mediaQuery = {};
    if (filters.mediaType) {
      mediaQuery.type = filters.mediaType;
    }
    
    console.log("Media query:", mediaQuery);
    
    const topMedia = await Media.find(mediaQuery)
      .sort({ totalTickets: -1, createdAt: -1 }) // Sort by tickets and then by creation date
      .limit(20) // Increased to get more media
      .populate({
        path: 'venues',
        match: { isAvailable: true }
      });
    
    console.log(`Found ${topMedia.length} media items to create billboard entries for`);
      
    // If no media found, return empty array
    if (topMedia.length === 0) {
      return [];
    }
    
    // Create billboard entries for each media
    const billboardPromises = topMedia.map(async (media, index) => {
      // Only create billboard if media has a valid type
      if (!media.type || !['movie', 'book'].includes(media.type)) {
        console.log(`Skipping media ${media._id} due to invalid type: ${media.type}`);
        return null;
      }
      
      console.log(`Creating billboard entry for media ${media._id} (${media.title}) of type ${media.type}`);
      
      try {
        const billboard = await Billboard.create({
          media: media._id,
          mediaType: media.type,
          totalTickets: media.totalTickets || 0,
          week: week,
          year: year,
          rank: index + 1,
          lastUpdated: currentDate
        });
        
        console.log(`Created billboard entry with rank ${billboard.rank} for ${media.title}`);
        
        return {
          media,
          mediaType: media.type,
          rank: billboard.rank,
          totalTickets: billboard.totalTickets,
          totalRevenue: billboard.totalTickets * (media.venues && media.venues[0]?.price || 0),
          popularity: billboard.totalTickets, // Add popularity field for books
          week: billboard.week,
          year: billboard.year,
          lastUpdated: billboard.lastUpdated
        };
      } catch (err) {
        console.error(`Error creating billboard entry for media ${media._id}:`, err);
        return null;
      }
    });

    try {
      const results = await Promise.all(billboardPromises);
      const filteredResults = results.filter(item => item !== null); // Filter out any null entries
      console.log(`Returning ${filteredResults.length} newly created billboard entries`);
      return filteredResults;
    } catch (error) {
      console.error("Error processing billboard promises:", error);
      return [];
    }
  }

  console.log(`Returning ${billboards.length} existing billboard entries`);
  
  return billboards.map(billboard => ({
    media: billboard.media,
    mediaType: billboard.mediaType,
    rank: billboard.rank,
    totalTickets: billboard.totalTickets,
    totalRevenue: billboard.totalTickets * (billboard.media.venues && billboard.media.venues[0]?.price || 0),
    popularity: billboard.totalTickets, // Add popularity field for books
    week: billboard.week,
    year: billboard.year,
    lastUpdated: billboard.lastUpdated
  }));
};

exports.getBillboardByWeekAndYear = async (week, year, mediaType = null) => {
  // Validate week and year
  if (!week || !year) {
    throw new Error('Week and year are required');
  }
  
  // Week should be between 1-52
  if (week < 1 || week > 52) {
    throw new Error('Week should be between 1 and 52');
  }

  // Build query
  const query = { 
    week: Number(week),
    year: Number(year)
  };
  
  // Add mediaType filter if provided
  if (mediaType && ['movie', 'book'].includes(mediaType)) {
    query.mediaType = mediaType;
  }

  const billboards = await Billboard.find(query)
  .populate({
    path: 'media',
    populate: {
      path: 'venues',
      match: { isAvailable: true }
    }
  })
  .sort({ totalTickets: -1 })
  .limit(10);

  return billboards.map(billboard => ({
    media: billboard.media,
    mediaType: billboard.mediaType,
    rank: billboard.rank,
    totalTickets: billboard.totalTickets,
    totalRevenue: billboard.totalTickets * (billboard.media.venues[0]?.price || 0),
    popularity: billboard.totalTickets, // Include popularity for books
    week: billboard.week,
    year: billboard.year,
    lastUpdated: billboard.lastUpdated
  }));
};

// Helper function to update billboard rankings
const updateBillboardRankings = async (week, year, mediaType) => {
  // Get all billboards for the given week/year/type
  const billboards = await Billboard.find({ week, year, mediaType })
    .sort({ totalTickets: -1 });
  
  // Update ranks
  for (let i = 0; i < billboards.length; i++) {
    if (billboards[i].rank !== i + 1) {
      billboards[i].rank = i + 1;
      await billboards[i].save();
    }
  }
};

exports.addMediaToBillboard = async (mediaId, mediaType) => {
  try {
    console.log(`Adding media ${mediaId} of type ${mediaType} to billboard`);
    
    // Validate parameters
    if (!mediaId || !mediaType || !['movie', 'book'].includes(mediaType)) {
      throw new Error('Valid media ID and type (movie or book) are required');
    }
    
    const media = await Media.findById(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }
    
    // Get current week and year
    const currentDate = new Date();
    const week = Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
    const year = currentDate.getFullYear();
    
    // Check if this media is already in the current billboard
    let existingBillboard = await Billboard.findOne({
      media: mediaId,
      week,
      year
    });
    
    if (existingBillboard) {
      console.log(`Updating existing billboard entry for media ${mediaId}`);
      // Update existing billboard entry and ensure mediaType is correct
      existingBillboard.mediaType = mediaType; // Ensure mediaType is set correctly
      existingBillboard.totalTickets = media.totalTickets || 0;
      existingBillboard.lastUpdated = currentDate;
      await existingBillboard.save();
    } else {
      console.log(`Creating new billboard entry for media ${mediaId}`);
      // Find the current count of billboard items for this week/year/type to determine rank
      const billboardCount = await Billboard.countDocuments({
        mediaType,
        week,
        year
      });
      
      // Create new billboard entry
      existingBillboard = new Billboard({
        media: mediaId,
        mediaType,
        totalTickets: media.totalTickets || 0,
        week,
        year,
        rank: billboardCount + 1,
        lastUpdated: currentDate
      });
      
      await existingBillboard.save();
    }
    
    // Force re-rank to ensure proper ordering
    await updateBillboardRankings(week, year, mediaType);
    
    // Return the updated or created billboard
    return existingBillboard;
  } catch (error) {
    console.error('Error adding media to billboard:', error);
    throw error;
  }
};
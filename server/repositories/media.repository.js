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
  return await media.save();
};

exports.updateMedia = async (id, mediaData) => {
  return await Media.findByIdAndUpdate(id, mediaData, { new: true }).populate('venues');
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

exports.getCurrentBillboard = async (filters = {}) => {
  const currentDate = new Date();
  const week = Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
  const year = currentDate.getFullYear();
  
  // Find billboards for current week and year
  const billboards = await Billboard.find({ 
    week: week,
    year: year
  })
  .populate({
    path: 'media',
    populate: {
      path: 'venues',
      match: { isAvailable: true }
    }
  })
  .sort({ totalTickets: -1 })
  .limit(5);

  // If no billboards exist for current week
  if (billboards.length === 0) {
    const topMedia = await Media.find()
      .sort({ totalTickets: -1 })
      .limit(5)
      .populate({
        path: 'venues',
        match: { isAvailable: true }
      });

    // Create billboard entries for each media
    const billboardPromises = topMedia.map(async (media, index) => {
      const billboard = await Billboard.create({
        media: media._id,
        totalTickets: media.totalTickets,
        week: week,
        year: year,
        rank: index + 1,
        lastUpdated: currentDate
      });
      
      return {
        media,
        rank: billboard.rank,
        totalTickets: billboard.totalTickets,
        totalRevenue: media.totalTickets * (media.venues[0]?.price || 0),
        week: billboard.week,
        year: billboard.year,
        lastUpdated: billboard.lastUpdated
      };
    });

    return Promise.all(billboardPromises);
  }

  return billboards.map(billboard => ({
    media: billboard.media,
    rank: billboard.rank,
    totalTickets: billboard.totalTickets,
    totalRevenue: billboard.totalTickets * (billboard.media.venues[0]?.price || 0),
    week: billboard.week,
    year: billboard.year,
    lastUpdated: billboard.lastUpdated
  }));
};

exports.getBillboardByWeekAndYear = async (week, year) => {
  // Validate week and year
  if (!week || !year) {
    throw new Error('Week and year are required');
  }
  
  // Week should be between 1-52
  if (week < 1 || week > 52) {
    throw new Error('Week should be between 1 and 52');
  }

  const billboards = await Billboard.find({ 
    week: Number(week),
    year: Number(year)
  })
  .populate({
    path: 'media',
    populate: {
      path: 'venues',
      match: { isAvailable: true }
    }
  })
  .sort({ totalTickets: -1 })
  .limit(5);

  return billboards.map(billboard => ({
    media: billboard.media,
    rank: billboard.rank,
    totalTickets: billboard.totalTickets,
    totalRevenue: billboard.totalTickets * (billboard.media.venues[0]?.price || 0),
    week: billboard.week,
    year: billboard.year,
    lastUpdated: billboard.lastUpdated
  }));
};
const Media = require('../models/Media');
const Billboard = require('../models/Billboard');
const Venue = require('../models/Venue');
const Ticket = require('../models/Ticket');

exports.getAllMedia = async (filters = {}, isGuest = false) => {
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
    } else if (filters.sortBy === 'views') {
      sortOptions.viewCount = -1;
    }
  }

  return await Media.find(query)
    .sort(sortOptions)
    .populate({
      path: 'venues',
      match: { isAvailable: true }
    });
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
    } else if (filters.sortBy === 'views') {
      sortOptions.viewCount = -1;
    }
  }
  
  return await Media.find(query)
    .sort(sortOptions)
    .populate({
      path: 'venues',
      match: { isAvailable: true }
    });
};

exports.getCurrentBillboard = async (filters = {}) => {
  const currentDate = new Date();
  const week = Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7);
  const year = currentDate.getFullYear();
  
  // Calculate ticket sales for the current week
  const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  const topMedia = await Ticket.aggregate([
    {
      $match: {
        purchaseDate: { $gte: startOfWeek, $lt: endOfWeek },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$media',
        totalTickets: { $sum: '$quantity' },
        totalRevenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { totalTickets: -1 } },
    { $limit: 5 }
  ]);
  
  // Get media details for the top selling media
  const mediaIds = topMedia.map(item => item._id);
  const mediaDetails = await Media.find({ _id: { $in: mediaIds } })
    .populate({
      path: 'venues',
      match: { isAvailable: true }
    });
  
  // Combine ticket data with media details
  const billboardData = mediaDetails.map(media => {
    const ticketData = topMedia.find(item => item._id.equals(media._id));
    return {
      media,
      rank: topMedia.findIndex(item => item._id.equals(media._id)) + 1,
      totalTickets: ticketData.totalTickets,
      totalRevenue: ticketData.totalRevenue
    };
  });
  
  return billboardData;
};

exports.purchaseTicket = async (userId, mediaId, venueId, quantity) => {
  const venue = await Venue.findById(venueId);
  if (!venue || !venue.isAvailable) {
    throw new Error('Venue is not available');
  }
  
  if (venue.availableSeats < quantity) {
    throw new Error('Not enough available seats');
  }
  
  // Create ticket
  const totalPrice = venue.price * quantity;
  const ticket = new Ticket({
    user: userId,
    media: mediaId,
    venue: venueId,
    quantity,
    totalPrice
  });
  
  // Update venue available seats
  venue.availableSeats -= quantity;
  await venue.save();
  
  // Save ticket
  await ticket.save();
  
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
  return await venue.save();
};
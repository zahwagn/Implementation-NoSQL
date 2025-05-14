const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/baseResponse');

exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // Jika tidak ada token, sebagai guest dan lanjutkan
    console.log("No token provided, assigning guest role");
    req.user = { role: 'guest', allowedCategories: ['kids'] };
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified, user:", decoded);
    req.user = decoded;
    
    if (!req.user.allowedCategories) {
      console.log("No allowedCategories found, setting default");
      req.user.allowedCategories = ['kids'];
    }
    
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return baseResponse(res, false, 400, "Invalid token");
  }
};

// Memastikan pengguna telah login (bukan guest)
exports.requireLogin = (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    return baseResponse(res, false, 401, "Login required");
  }
  next();
};

// Memeriksa batasan usia untuk akses kategori
exports.checkAgeRestriction = (req, res, next) => {
  if (!req.user) {
    req.user = { role: 'guest', allowedCategories: ['kids'] };
  }

  if (!req.user.allowedCategories) {
    req.user.allowedCategories = ['kids'];
  }

  next();
};

// Memeriksa akses CRUD berdasarkan kategori usia
exports.checkCategoryAccess = (req, res, next) => {
  // Memastikan user telah login untuk operasi CRUD
  if (!req.user || req.user.role !== 'user') {
    return baseResponse(res, false, 401, "Login required for this operation");
  }

  if (!req.user.allowedCategories) {
    req.user.allowedCategories = ['kids'];
  }

  // Cek akses berdasarkan kategori usia untuk operasi POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const ageCategory = req.body?.ageCategory;
    
    if (ageCategory && !req.user.allowedCategories.includes(ageCategory)) {
      return baseResponse(
        res,
        false,
        403,
        `Access denied. Your age group doesn't allow you to ${req.method} media with category ${ageCategory}`
      );
    }
  } 
  
  else if (req.method === 'GET') {
    const ageCategory = req.query?.ageCategory;
    
    if (ageCategory && !req.user.allowedCategories.includes(ageCategory)) {
      return baseResponse(
        res,
        false,
        403,
        `Access denied. Your age group doesn't have access to ${ageCategory} category`
      );
    }
  }
  
  next();
};
const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/baseResponse');

exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return baseResponse(res, false, 401, "Access denied. No token provided");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return baseResponse(res, false, 400, "Invalid token");
  }
};

exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return baseResponse(res, false, 403, "Forbidden. You don't have permission");
    }
    next();
  };
};

exports.checkAgeRestriction = (req, res, next) => {
  // GET media checked on kategori usia
  if (req.method === 'GET' && req.originalUrl.includes('/media')) {
    const { ageCategory } = req.query;
    
    if (ageCategory && !req.user.allowedCategories.includes(ageCategory)) {
      return baseResponse(
        res, 
        false, 
        403, 
        `Access denied. Your age group (${req.user.age}) doesn't have access to this category`
      );
    }
  }
  next();
};
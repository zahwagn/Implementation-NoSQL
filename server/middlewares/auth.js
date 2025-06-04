const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/baseResponse');

exports.authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1]; 
  
  if (!token) {
    return baseResponse(res, false, 401, "Access denied. No token provided");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add token expiration check
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return baseResponse(res, false, 401, "Token expired");
    }
    
    req.user = {
      id: decoded.id,
      age: decoded.age,
      role: decoded.role,
      allowedCategories: decoded.allowedCategories || []
    };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return baseResponse(res, false, 401, "Invalid token");
  }
};

exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return baseResponse(res, false, 401, "Authentication required");
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return baseResponse(res, false, 403, "Forbidden. Insufficient permissions");
    }
    next();
  };
};

exports.checkAgeRestriction = (req, res, next) => {
  if (req.method !== 'GET') return next();
  
  // Skip check if no user (guest)
  if (!req.user) return next();
  
  // Validate user has allowedCategories
  if (!req.user.allowedCategories || !Array.isArray(req.user.allowedCategories)) {
    return baseResponse(res, false, 403, "User age category not properly configured");
  }
  
  // Check age category for media requests
  if (req.path.includes('/media')) {
    const { ageCategory } = req.query;
    
    if (ageCategory && !req.user.allowedCategories.includes(ageCategory)) {
      return baseResponse(
        res, 
        false, 
        403, 
        `Access denied. Your age group doesn't have access to ${ageCategory} content`
      );
    }
  }
  
  next();
};
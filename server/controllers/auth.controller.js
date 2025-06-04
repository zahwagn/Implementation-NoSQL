const jwt = require('jsonwebtoken');
const User = require('../models/User');
const baseResponse = require('../utils/baseResponse');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, age, email, password } = req.body;
    
    // Comprehensive validation
    const errors = [];
    if (!firstName) errors.push("First name is required");
    if (!lastName) errors.push("Last name is required");
    if (!username) errors.push("Username is required");
    if (!age) errors.push("Age is required");
    if (!email) errors.push("Email is required");
    if (!password) errors.push("Password is required");
    
    if (errors.length > 0) {
      return baseResponse(res, false, 400, "Validation errors", { errors });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return baseResponse(res, false, 400, "Invalid email format");
    }
    
    // Validate password strength
    if (password.length < 8) {
      return baseResponse(res, false, 400, "Password must be at least 8 characters");
    }
    
    // Validate age range
    if (age < 3 || age > 120) {
      return baseResponse(res, false, 400, "Age must be between 3 and 120");
    }
    
    // Check existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return baseResponse(res, false, 400, "Username or email already exists");
    }
    
    // Create user
    const user = new User({ 
      firstName, 
      lastName, 
      username, 
      age, 
      email, 
      password 
    });
    
    await user.save();
    
    // Generate token with expiration
    const token = jwt.sign(
      {
        id: user._id,
        age: user.age,
        role: user.role,
        allowedCategories: user.allowedCategories
      },
      process.env.JWT_SECRET,
      { expiresIn: '5d' } 
    );
    
    return baseResponse(res, true, 201, "User registered successfully", { 
      user: user.toJSON(),
      token 
    });
  } catch (error) {
    console.error("Registration error:", error);
    return baseResponse(res, false, 500, "Registration failed", error.message);
  }
};

// Enhanced login with rate limiting consideration
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return baseResponse(res, false, 400, "Email and password are required");
    }
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return baseResponse(res, false, 401, "Invalid credentials");
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return baseResponse(res, false, 401, "Invalid credentials");
    }
    
    // Generate token with user details
    const token = jwt.sign(
      {
        id: user._id,
        age: user.age,
        role: user.role,
        allowedCategories: user.allowedCategories
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Omit sensitive data from response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      age: user.age,
      email: user.email,
      role: user.role,
      allowedCategories: user.allowedCategories
    };
    
    return baseResponse(res, true, 200, "Login successful", { 
      user: userResponse,
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    return baseResponse(res, false, 500, "Login failed", error.message);
  }
};
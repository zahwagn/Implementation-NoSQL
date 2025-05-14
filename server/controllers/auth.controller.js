const jwt = require('jsonwebtoken');
const User = require('../models/User');
const baseResponse = require('../utils/baseResponse');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, age, email, password } = req.body;
    
    // Validasi
    if (!firstName || !lastName || !username || !age || !email || !password) {
      return baseResponse(res, false, 400, "All fields are required");
    }
    
    // Validasi usia
    if (age < 3 || age > 120) {
      return baseResponse(res, false, 400, "Age must be between 3 and 120");
    }
    
    // Cek jika user sudah ada
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return baseResponse(res, false, 400, "Username or email already exists");
    }
    
    // Buat user baru (allowedCategories akan di-set otomatis oleh pre-save hook)
    const user = new User({ 
      firstName, 
      lastName, 
      username, 
      age, 
      email, 
      password 
    });
    
    await user.save();
    
    // Generate token
const token = jwt.sign({
  id: user._id,
  age: user.age,
  allowedCategories: user.allowedCategories, 
  role: user.role
}, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    return baseResponse(res, true, 201, "User registered successfully", { 
      user: { 
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        age: user.age,
        email: user.email,
        role: user.role,
        allowedCategories: user.allowedCategories
      },
      token 
    });
  } catch (error) {
    console.error("Registration error:", error);
    return baseResponse(res, false, 500, "Registration failed", error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validasi
    if (!email || !password) {
      return baseResponse(res, false, 400, "Email and password are required");
    }
    
    // Cek user
    const user = await User.findOne({ email });
    if (!user) {
      return baseResponse(res, false, 401, "Invalid credentials");
    }
    
    // Verifikasi password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return baseResponse(res, false, 401, "Invalid credentials");
    }
    
    // Generate token
      const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        age: user.age,
        allowedCategories: user.allowedCategories 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    
    return baseResponse(res, true, 200, "Login successful", { 
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    return baseResponse(res, false, 500, "Login failed", error.message);
  }
};
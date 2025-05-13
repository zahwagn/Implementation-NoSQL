const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true, min: 3, max: 120 },
  allowedCategories: { type: [String], default: [] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// Middleware untuk set allowedCategories sebelum save
userSchema.pre('save', function(next) {
  if (this.isModified('age')) {
    if (this.age >= 3 && this.age <= 12) {
      this.allowedCategories = ['kids'];
    } else if (this.age >= 13 && this.age <= 19) {
      this.allowedCategories = ['kids', 'teen'];
    } else if (this.age >= 20) {
      this.allowedCategories = ['all', 'kids', 'teen', 'adult'];
    }
  }
  next();
});

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method untuk compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
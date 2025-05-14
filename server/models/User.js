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
  role: { type: String, default: 'user' }, // Hanya memiliki role 'user'
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('age')) {

    if (this.age >= 3 && this.age <= 12) {
      this.allowedCategories = ['kids'];
    } else if (this.age >= 13 && this.age <= 17) {
      this.allowedCategories = ['kids', 'teen'];
    } else if (this.age >= 18) {
      this.allowedCategories = ['kids', 'teen', 'adult', 'all'];
    } else {
      this.allowedCategories = ['kids'];
    }
    
    console.log(`User ${this.username} age ${this.age} - allowed categories set to:`, this.allowedCategories);
  }
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
require('dotenv').config(); // Load environment variables from .env file

// Define the user schema
const UserSchema = new Schema({
  first_name: String,
  last_name: String,
  company_name: String,
  title: String,
  email_address: String,
  mobile_number: String,
  dateAdded: { type: Date, default: Date.now }
});

UserSchema.plugin(passportLocalMongoose);

UserSchema.pre('save', async function(next) {
  try {
    // check method of registration
    const user = this;
    if (!user.isModified('password')) next();
    // generate salt
    const salt = await bcrypt.genSalt(10);
    // hash the password
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // replace plain text password with hashed password
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.matchPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
 };

// Create the User model
const User = mongoose.model('User', UserSchema);

module.exports = User;
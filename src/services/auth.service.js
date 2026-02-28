const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Register a new user.
 * @param {Object} data - { email, password }
 * @returns {Object} created user (without password)
 */
const register = async ({ email, password }) => {
  // Validate input
  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.statusCode = 400;
    throw err;
  }

  // Check for existing user
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const err = new Error("A user with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  // Create user (password is hashed via pre-save hook)
  const user = await User.create({ email, password });

  // Return user without password
  return user.toJSON();
};

/**
 * Authenticate a user and return a JWT.
 * @param {Object} data - { email, password }
 * @returns {Object} { user, token }
 */
const login = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.statusCode = 400;
    throw err;
  }

  // Find user and explicitly include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { user: user.toJSON(), token };
};

module.exports = { register, login };

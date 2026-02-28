const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  bedrooms: {
    type: Number,
    min: [0, "Bedrooms cannot be negative"],
  },
  bathrooms: {
    type: Number,
    min: [0, "Bathrooms cannot be negative"],
  },
  area: {
    type: Number,
    min: [0, "Area cannot be negative"],
  },
  type: {
    type: String,
    enum: {
      values: ["rent", "sale"],
      message: "Type must be either 'rent' or 'sale'",
    },
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "approved", "rejected"],
      message: "Status must be 'pending', 'approved', or 'rejected'",
    },
    default: "pending",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for common query patterns
propertySchema.index({ status: 1, price: 1 });
propertySchema.index({ user: 1 });
propertySchema.index({ location: 1 });

module.exports = mongoose.model("Property", propertySchema);

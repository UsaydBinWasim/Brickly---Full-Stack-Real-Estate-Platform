const Property = require("../models/property.model");

/**
 * Create a new property listing.
 */
const createProperty = async (data, userId, files = []) => {
  const images = files.map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  const property = await Property.create({
    ...data,
    images,
    user: userId,
    status: "pending",
  });
  return property;
};

/**
 * Get approved properties with optional filters and pagination.
 */
const getApprovedProperties = async (filters = {}, page = 1, limit = 10) => {
  const query = { status: "approved" };

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  // Location (case-insensitive partial match)
  if (filters.location) {
    query.location = { $regex: filters.location, $options: "i" };
  }

  // Bedrooms (exact match)
  if (filters.bedrooms) {
    query.bedrooms = Number(filters.bedrooms);
  }

  // Type
  if (filters.type) {
    query.type = filters.type;
  }

  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    Property.find(query)
      .populate("user", "email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Property.countDocuments(query),
  ]);

  return {
    results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get a single property by ID.
 */
const getPropertyById = async (id) => {
  const property = await Property.findById(id).populate("user", "email role");

  if (!property) {
    const err = new Error("Property not found");
    err.statusCode = 404;
    throw err;
  }

  return property;
};

/**
 * Update a property (owner or admin only).
 */
const updateProperty = async (id, userId, role, updateData) => {
  const property = await Property.findById(id);

  if (!property) {
    const err = new Error("Property not found");
    err.statusCode = 404;
    throw err;
  }

  const isOwner = property.user.toString() === userId;
  const isAdmin = role === "admin";

  if (!isOwner && !isAdmin) {
    const err = new Error("Forbidden — you do not have permission to update this property");
    err.statusCode = 403;
    throw err;
  }

  // Prevent non-admins from changing status directly
  if (!isAdmin) {
    delete updateData.status;
  }

  Object.assign(property, updateData);
  await property.save();

  return property;
};

/**
 * Delete a property (owner or admin only).
 */
const deleteProperty = async (id, userId, role) => {
  const property = await Property.findById(id);

  if (!property) {
    const err = new Error("Property not found");
    err.statusCode = 404;
    throw err;
  }

  const isOwner = property.user.toString() === userId;
  const isAdmin = role === "admin";

  if (!isOwner && !isAdmin) {
    const err = new Error("Forbidden — you do not have permission to delete this property");
    err.statusCode = 403;
    throw err;
  }

  await property.deleteOne();

  return { message: "Property deleted successfully" };
};

/**
 * Get all properties for a specific user (any status).
 */
const getUserProperties = async (userId) => {
  const properties = await Property.find({ user: userId })
    .populate("user", "email role")
    .sort({ createdAt: -1 });
  return properties;
};

module.exports = {
  createProperty,
  getApprovedProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUserProperties,
};

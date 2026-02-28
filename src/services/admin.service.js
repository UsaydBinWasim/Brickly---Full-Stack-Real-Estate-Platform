const Property = require("../models/property.model");

const VALID_STATUSES = ["pending", "approved", "rejected"];

/**
 * Approve a property listing.
 */
const approveProperty = async (propertyId) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    const err = new Error("Property not found");
    err.statusCode = 404;
    throw err;
  }

  property.status = "approved";
  await property.save();

  return property;
};

/**
 * Reject a property listing.
 */
const rejectProperty = async (propertyId) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    const err = new Error("Property not found");
    err.statusCode = 404;
    throw err;
  }

  property.status = "rejected";
  await property.save();

  return property;
};

/**
 * Get all listings with optional status filter and pagination (admin view).
 */
const getAllProperties = async (filters = {}, page = 1, limit = 20) => {
  const query = {};

  // Optional status filter
  if (filters.status) {
    if (!VALID_STATUSES.includes(filters.status)) {
      const err = new Error(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
      );
      err.statusCode = 400;
      throw err;
    }
    query.status = filters.status;
  }

  // Optional user filter
  if (filters.user) {
    query.user = filters.user;
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

module.exports = { approveProperty, rejectProperty, getAllProperties };

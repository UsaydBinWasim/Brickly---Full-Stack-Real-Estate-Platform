const Favorite = require("../models/favorite.model");
const Property = require("../models/property.model");

/**
 * Add a property to the user's favorites.
 */
const addFavorite = async (userId, propertyId) => {
  // Verify property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    const err = new Error("Property not found");
    err.statusCode = 404;
    throw err;
  }

  // Check for duplicate
  const existing = await Favorite.findOne({ user: userId, property: propertyId });
  if (existing) {
    const err = new Error("Property is already in your favorites");
    err.statusCode = 409;
    throw err;
  }

  const favorite = await Favorite.create({ user: userId, property: propertyId });
  return favorite;
};

/**
 * Remove a property from the user's favorites.
 */
const removeFavorite = async (userId, propertyId) => {
  const favorite = await Favorite.findOneAndDelete({
    user: userId,
    property: propertyId,
  });

  if (!favorite) {
    const err = new Error("Favorite not found");
    err.statusCode = 404;
    throw err;
  }

  return { message: "Property removed from favorites" };
};

/**
 * Get all favorites for a user (populated with property details).
 */
const getUserFavorites = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const query = { user: userId };

  const [results, total] = await Promise.all([
    Favorite.find(query)
      .populate({
        path: "property",
        populate: { path: "user", select: "email role" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Favorite.countDocuments(query),
  ]);

  return {
    results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = { addFavorite, removeFavorite, getUserFavorites };

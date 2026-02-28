const favoriteService = require("../services/favorite.service");

/**
 * POST /api/favorites/:propertyId
 */
const addFavorite = async (req, res, next) => {
  try {
    const favorite = await favoriteService.addFavorite(
      req.user.userId,
      req.params.propertyId
    );
    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/favorites/:propertyId
 */
const removeFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.removeFavorite(
      req.user.userId,
      req.params.propertyId
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favorites
 */
const getUserFavorites = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const result = await favoriteService.getUserFavorites(
      req.user.userId,
      pageNum,
      limitNum
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addFavorite, removeFavorite, getUserFavorites };

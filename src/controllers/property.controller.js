const propertyService = require("../services/property.service");

/**
 * POST /api/properties
 */
const createProperty = async (req, res, next) => {
  try {
    const property = await propertyService.createProperty(
      req.body,
      req.user.userId
    );
    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/properties
 */
const getProperties = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, location, bedrooms, type, page, limit } =
      req.query;

    const filters = { minPrice, maxPrice, location, bedrooms, type };
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const result = await propertyService.getApprovedProperties(
      filters,
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

/**
 * GET /api/properties/:id
 */
const getPropertyById = async (req, res, next) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/properties/:id
 */
const updateProperty = async (req, res, next) => {
  try {
    const property = await propertyService.updateProperty(
      req.params.id,
      req.user.userId,
      req.user.role,
      req.body
    );
    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/properties/:id
 */
const deleteProperty = async (req, res, next) => {
  try {
    const result = await propertyService.deleteProperty(
      req.params.id,
      req.user.userId,
      req.user.role
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
 * GET /api/properties/my
 */
const getUserProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.getUserProperties(req.user.userId);
    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUserProperties,
};

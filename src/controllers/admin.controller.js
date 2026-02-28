const adminService = require("../services/admin.service");

/**
 * PATCH /api/admin/properties/:id/approve
 */
const approveProperty = async (req, res, next) => {
  try {
    const property = await adminService.approveProperty(req.params.id);
    res.status(200).json({
      success: true,
      message: "Property approved",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/properties/:id/reject
 */
const rejectProperty = async (req, res, next) => {
  try {
    const property = await adminService.rejectProperty(req.params.id);
    res.status(200).json({
      success: true,
      message: "Property rejected",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/properties
 */
const getAllProperties = async (req, res, next) => {
  try {
    const { status, user, page, limit } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (user) filters.user = user;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const result = await adminService.getAllProperties(
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

module.exports = { approveProperty, rejectProperty, getAllProperties };

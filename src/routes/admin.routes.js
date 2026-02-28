const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// All admin routes require authentication + admin role
router.use(protect, authorize("admin"));

router.get("/properties", adminController.getAllProperties);
router.patch("/properties/:id/approve", adminController.approveProperty);
router.patch("/properties/:id/reject", adminController.rejectProperty);

module.exports = router;

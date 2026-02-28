const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, propertyController.createProperty);
router.get("/", propertyController.getProperties);
router.get("/my", protect, propertyController.getUserProperties);
router.get("/:id", propertyController.getPropertyById);
router.put("/:id", protect, propertyController.updateProperty);
router.delete("/:id", protect, propertyController.deleteProperty);

module.exports = router;

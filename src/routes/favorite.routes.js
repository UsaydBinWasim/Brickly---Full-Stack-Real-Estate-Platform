const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const { protect } = require("../middleware/auth.middleware");

// All favorite routes require authentication
router.use(protect);

router.get("/", favoriteController.getUserFavorites);
router.post("/:propertyId", favoriteController.addFavorite);
router.delete("/:propertyId", favoriteController.removeFavorite);

module.exports = router;

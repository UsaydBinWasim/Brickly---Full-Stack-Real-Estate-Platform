const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const propertyRoutes = require("./routes/property.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const adminRoutes = require("./routes/admin.routes");
const chatRoutes = require("./routes/chat.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// --------------- Global Middleware ---------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --------------- Health Check --------------------
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Brickly API is running" });
});

// --------------- API Routes ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// --------------- 404 Handler ---------------------
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// --------------- Error Handler -------------------
app.use(errorHandler);

module.exports = app;

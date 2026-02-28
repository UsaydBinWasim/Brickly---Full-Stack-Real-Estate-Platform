/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes.
 */
const errorHandler = (err, req, res, _next) => {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(". "),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    return res.status(409).json({
      success: false,
      message: `Duplicate value for: ${field}`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid token",
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;

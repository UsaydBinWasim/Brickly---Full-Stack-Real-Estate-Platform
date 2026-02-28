const jwt = require("jsonwebtoken");

/**
 * Protect routes — verify JWT from Authorization header.
 * Attaches userId and role to req.user on success.
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid token",
    });
  }
};

/**
 * Restrict access to specific roles.
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden — insufficient permissions",
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

const multer = require("multer");
const path = require("path");
const fs = require("fs");

let storage;

// Use Cloudinary if credentials are configured, otherwise fall back to local disk
const hasCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_KEY !== "your_api_key";

if (hasCloudinary) {
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  const cloudinary = require("../config/cloudinary");

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "brickly/properties",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1200, height: 800, crop: "limit", quality: "auto" },
      ],
    },
  });
  console.log("Image storage: Cloudinary");
} else {
  // Local disk storage fallback
  const uploadDir = path.join(__dirname, "../../uploads/properties");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  });
  console.log("Image storage: Local disk (uploads/properties/)");
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpg|jpeg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.replace("image/", ""));
    cb(null, ext && mime);
  },
});

module.exports = upload;

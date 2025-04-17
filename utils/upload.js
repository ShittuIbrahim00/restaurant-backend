import dotenv from "dotenv";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

dotenv.config();

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const folder = (file.fieldname = "avatar"
      ? "avatars"
      : (file.fieldname = "banner"
          ? "banners"
          : (file.fieldname = "video"
              ? "videos"
              : (file.fieldname = "cover" ? "covers" : "default"))));

    const allowedFormat = file.mimetype.startsWith("video/")
      ? ["mp4", "mov", "avi"]
      : ["jpeg", "jpg", "webp", "png", "gif"];

    return {
      folder: folder,
      allowedFormat: allowedFormat,
      resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // limit 10 mb,
  fileFilter(req, file, cb) {
    console.log("file details ", file);
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/avi",
      "video/mov",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error(
        "Invalid file type. only JPEG, JPG, WEBP, PNG, GIF, MOV, AVI, MP4"
      );
      error.code = "LIMIT_FILE_TYPES";
      return cb(error);
    }
    cb(null, true);
  },
}).fields([
  { name: "avatar" },
  { name: "banner" },
  { name: "video" },
  { name: "cover" },
  { name: "images" },
  { name: "image" },
]);

// Middleware to handle file uploads, multer errror and log the details
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error ", err);
      return res
        .status(400)
        .json({ message: "File upload error ", error: err.message });
    } else if (err) {
      console.error("Unknown upload error", err);
      return res
        .status(400)
        .json({ message: "File upload error ", error: err.message });
    }
    // debug
    console.log("Resquest body", req.body);
    console.log("Request files", req.files);
    next()
  });
};

export default uploadMiddleware;

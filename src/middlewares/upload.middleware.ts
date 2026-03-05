import path from "path";
import fs from "fs";
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import slug from "../utils/slug";

// /public/uploads
const uploadDir = path.join(process.cwd(), "uploads");

// pastikan uploadDir ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, slug(file.originalname) + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/svg+xml"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, WEBP, PNG, JPG, and SVG files are allowed!"));
  }
};

// Inilialisasi multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter,
});

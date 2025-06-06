// uploadMiddleware.ts
import multer from "multer";
import path from "path";
import { Request } from "express";

// Extend Express Request to include fileValidationError
declare module "express-serve-static-core" {
  interface Request {
    fileValidationError?: string;
  }
}

// Multer memory storage
const storage = multer.memoryStorage();

// File filter for CSV validation
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  if (extname === ".csv" && mimetype === "text/csv") {
    cb(null, true);
  } else {
    req.fileValidationError = "Only CSV files are allowed!";
    cb(null, false); // reject the file without throwing
  }
};

// Multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

export const uploadCsv = upload.single("csvFile"); // name of the file input field

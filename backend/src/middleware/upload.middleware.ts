import multer from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    cb(ApiError.badRequest('Only JPEG, PNG, WEBP or GIF images are allowed'));
    return;
  }
  cb(null, true);
}

// In-memory buffer, not disk — the file is uploaded straight to Cloudinary
// from the buffer (see cloudinary.ts), since local disk doesn't survive a
// Render redeploy.
export const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

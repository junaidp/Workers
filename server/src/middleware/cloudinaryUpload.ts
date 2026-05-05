import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Use memory storage to buffer files before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP files are allowed.'), false);
  }
};

export const cloudinaryUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Middleware to upload files to Cloudinary after multer processing
export const uploadToCloudinaryMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return next();
    }

    console.log('Processing', req.files.length, 'files for Cloudinary upload');

    // Upload each file to Cloudinary
    const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
      console.log('Uploading file:', file.originalname, 'Size:', file.size);
      const url = await uploadToCloudinary(file);
      return {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: url
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    
    console.log('All files uploaded successfully:', uploadedFiles.map(f => f.url));
    
    // Replace req.files with Cloudinary URLs
    req.files = uploadedFiles as any;
    
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Failed to upload images to cloud storage' });
  }
};

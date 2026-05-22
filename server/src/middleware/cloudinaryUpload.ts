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

    // Upload each file to Cloudinary with individual error handling
    const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
      try {
        console.log('Uploading file:', file.originalname, 'Size:', file.size);
        const url = await uploadToCloudinary(file);
        return {
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: url
        };
      } catch (error) {
        console.error('Failed to upload file:', file.originalname, error);
        return null;
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    const uploadedFiles = uploadResults.filter(file => file !== null);
    
    if (uploadedFiles.length > 0) {
      console.log('Successfully uploaded', uploadedFiles.length, 'files:', uploadedFiles.map(f => f!.url));
      req.files = uploadedFiles as any;
    } else {
      console.warn('No files were successfully uploaded, continuing without images');
      req.files = [];
    }
    
    next();
  } catch (error) {
    console.error('Cloudinary upload middleware error:', error);
    // Continue without images instead of failing the request
    console.warn('Continuing request without images due to upload error');
    req.files = [];
    next();
  }
};

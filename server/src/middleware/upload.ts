import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Use memory storage to buffer files before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF files are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Middleware to upload files to Cloudinary after multer processing
export const uploadToCloudinaryMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle single file upload
    if (req.file) {
      console.log('Processing single file for Cloudinary upload:', req.file.originalname);
      const url = await uploadToCloudinary(req.file);
      (req as any).cloudinaryUrl = url;
      console.log('Single file uploaded successfully:', url);
    }

    // Handle multiple files upload
    if (req.files) {
      if (Array.isArray(req.files)) {
        console.log('Processing', req.files.length, 'files for Cloudinary upload');
        const uploadPromises = req.files.map(async (file) => {
          const url = await uploadToCloudinary(file);
          return { ...file, cloudinaryUrl: url };
        });
        const uploadedFiles = await Promise.all(uploadPromises);
        (req as any).cloudinaryFiles = uploadedFiles;
        console.log('All files uploaded successfully');
      } else {
        // Handle fields-based upload (e.g., upload.fields())
        const fieldNames = Object.keys(req.files);
        const cloudinaryFiles: any = {};
        
        for (const fieldName of fieldNames) {
          const files = (req.files as any)[fieldName];
          console.log(`Processing ${files.length} files for field: ${fieldName}`);
          
          const uploadPromises = files.map(async (file: Express.Multer.File) => {
            const url = await uploadToCloudinary(file);
            return { ...file, cloudinaryUrl: url };
          });
          
          cloudinaryFiles[fieldName] = await Promise.all(uploadPromises);
        }
        
        (req as any).cloudinaryFiles = cloudinaryFiles;
        console.log('All field files uploaded successfully');
      }
    }

    next();
  } catch (error) {
    console.error('Cloudinary upload middleware error:', error);
    res.status(500).json({ message: 'Failed to upload files to cloud storage' });
  }
};

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dx5xvlojc',
  api_key: process.env.CLOUDINARY_API_KEY || '981511359158459',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'TdVmH5UKkuL9d8YrtaWZ2ocCzxE'
});

console.log('Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME || 'dx5xvlojc');

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Starting Cloudinary upload for file:', file.originalname, 'mimetype:', file.mimetype);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'worknfix',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error for file:', file.originalname, error);
          reject(error);
        } else {
          console.log('Cloudinary upload successful:', result?.secure_url);
          resolve(result!.secure_url);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = Readable.from(file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export const extractPublicIdFromUrl = (url: string): string => {
  const matches = url.match(/\/([^\/]+)\.[^.]+$/);
  return matches ? matches[1] : '';
};

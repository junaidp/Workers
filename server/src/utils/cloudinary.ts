import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dx5xvlojc',
  api_key: process.env.CLOUDINARY_API_KEY || '277458255413249',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'xIi8gXM3vDFjZGbhLhNIhhJNCs'
});

console.log('Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME || 'dx5xvlojc');

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  try {
    console.log('Starting Cloudinary upload for file:', file.originalname);
    
    // Use the simpler upload method with buffer
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${file.buffer.toString('base64')}`,
      {
        folder: 'job-images',
        resource_type: 'image'
      }
    );
    
    console.log('Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
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

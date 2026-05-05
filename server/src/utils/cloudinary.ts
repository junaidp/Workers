import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dx5xvlojc',
  api_key: '277458255413249',
  api_secret: 'xIi8gXM3vDFjZGbhLhNIhhJNCs'
});

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'job-images',
        resource_type: 'image',
        format: 'webp',
        quality: 'auto:good',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Unknown error during upload'));
        }
      }
    );

    // Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream._read = () => {}; // _read is required but you can noop it
    readableStream.push(file.buffer);
    readableStream.push(null);

    readableStream.pipe(uploadStream);
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

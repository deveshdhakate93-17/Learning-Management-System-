import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} [resourceType='auto'] - 'image' | 'video' | 'raw' | 'auto'
 * @returns {Promise<{url: string, publicId: string, format: string, bytes: number}>}
 */
export const uploadToCloudinary = (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `lms/${folder}`,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'mov', 'doc', 'docx'],
        max_bytes: 50 * 1024 * 1024, // 50MB
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

/**
 * Delete a file from Cloudinary by public ID.
 * @param {string} publicId - Cloudinary public ID
 * @param {string} [resourceType='image'] - Resource type
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('Cloudinary delete failed:', err.message);
  }
};

/**
 * Upload a note/PDF to Cloudinary.
 */
export const uploadNote = async (file) => {
  return uploadToCloudinary(file.buffer, 'notes', 'raw');
};

/**
 * Upload a user avatar to Cloudinary.
 */
export const uploadAvatar = async (file) => {
  return uploadToCloudinary(file.buffer, 'avatars', 'image');
};

/**
 * Upload a course thumbnail to Cloudinary.
 */
export const uploadCourseThumbnail = async (file) => {
  return uploadToCloudinary(file.buffer, 'courses', 'image');
};

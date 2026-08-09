import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

export function uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error || new Error('Cloudinary upload returned no result'));
        return;
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
}

// Cloudinary secure_urls always look like:
// https://res.cloudinary.com/<cloud>/<resource_type>/upload/v<version>/<public_id>.<ext>
// public_id can itself contain folder slashes, so it's everything between the
// version segment and the final extension.
export function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

export { cloudinary };

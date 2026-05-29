import { Readable } from "stream";
import cloudinary from "./cloudinary.js"

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

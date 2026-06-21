import cloudinary from "../../config/cloudinary.js";
import fs from "fs";
const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "localloop",
  });
  fs.unlinkSync(filePath);
  return result;
};

export const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};
export default uploadToCloudinary;

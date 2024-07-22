import { v2 as cloudinary } from "cloudinary"; // Importing Cloudinary's v2 API
import fs from "fs"; // Importing the file system module

// Configuring Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary and removes the local copy.
 * @param {string} localFilePath - Path to the local file to be uploaded.
 * @returns {Object|null} - Returns the Cloudinary response object on success or null on failure.
 */

const uploadOnCloudinary = async (localFilePath) => {
    try {
      if (!localFilePath) return null;
      //console.log("in localpath",localFilePath);
  
      //upload to cloudinary
  
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      })
      if (response) {
       fs.unlinkSync(localFilePath);// Remove the local file after successful upload
      }
      //console.log(localFilePath);
      return response;
      //file uploaded successfully
    } 
    catch (error) {
      fs.unlinkSync(localFilePath); // remvove the file from local storage as the file upload failed
      return null;
    }
  };


export { uploadOnCloudinary }; // Export the uploadOnCloudinary function

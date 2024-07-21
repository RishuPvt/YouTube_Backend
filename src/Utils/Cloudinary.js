import { v2 as cloudinary } from "cloudinary"; // Importing Cloudinary's v2 API
import fs from "fs"; // Importing the file system module

// Configuring Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


/**
 * Uploads a file to Cloudinary and removes the local copy.
 * @param {string} localFilePath - Path to the local file to be uploaded.
 * @returns {Object|null} - Returns the Cloudinary response object on success or null on failure.
 */


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // If no file path is provided, return null

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically determine the resource type (image, video, etc.)
        });
          // console.log("checking cloudinary response", response)
        // File has been uploaded successfully
        // Remove the local file after successful upload
         fs.unlinkSync(localFilePath); 

        return response; // Return the Cloudinary response object

    } catch (error) {
        // Remove the local file if the upload operation fails
        fs.unlinkSync(localFilePath);

        return null; // Return null on failure
    }
};

export { uploadOnCloudinary }; // Export the uploadOnCloudinary function

import multer from "multer"; // Importing multer for handling multipart/form-data, primarily used for uploading files
//npm install uuid
import { v4 as uuidv4 } from 'uuid';
//npm install path
import path from 'path';

// Configuring the storage settings for multer
const storage = multer.diskStorage({
    // Setting the destination where the uploaded files will be stored
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // Storing files in the "./public/temp" directory
    },
    // Setting the filename for the uploaded files
    filename: function (req, file, cb) {
       // Generate a unique suffix using a combination of UUID and current timestamp
       const uniqueSuffix = `${uuidv4()}${Date.now()}`;

       // Get the original file extension (e.g., .jpg, .png) from the uploaded file's name
       const extension = path.extname(file.originalname);

       // Construct a unique filename using the unique suffix and original file extension
       const uniqueFileName = `${uniqueSuffix}${extension}`;

       // Pass the unique filename to the callback function to use as the stored filename
       cb(null, uniqueFileName);
    }
});

// Creating an instance of multer with the defined storage settings
export const upload = multer({ 
    storage // Using the custom storage settings defined above
});

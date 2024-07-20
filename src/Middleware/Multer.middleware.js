import multer from "multer"; // Importing multer for handling multipart/form-data, primarily used for uploading files

// Configuring the storage settings for multer
const storage = multer.diskStorage({
    // Setting the destination where the uploaded files will be stored
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // Storing files in the "./public/temp" directory
    },
    // Setting the filename for the uploaded files
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Using the original name of the file as the filename
    }
});

// Creating an instance of multer with the defined storage settings
export const upload = multer({ 
    storage // Using the custom storage settings defined above
});

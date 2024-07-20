// Importing necessary modules
import express from "express"; // Express framework for building web applications
import cors from "cors"; // Middleware to enable Cross-Origin Resource Sharing
import cookieParser from "cookie-parser"; // Middleware to parse cookies

// Creating an instance of an Express application
const app = express();

// Enabling CORS (Cross-Origin Resource Sharing) with specific options
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allowing only the specified origin to access resources
    credentials: true // Allowing cookies and other credentials to be sent in cross-origin requests
}));

// Middleware to parse JSON payloads with a size limit of 16kb
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded payloads with a size limit of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Middleware to serve static files from the "public" directory
app.use(express.static("public"));

// Middleware to parse cookies attached to the client request object
app.use(cookieParser());




// Importing user routes from the "user.routes.js" file
import UserRouter from "./Routes/user.routes.js";


// Setting up the "/user" route to be handled by UserRouter
app.use("/api/v1/users", UserRouter);


// http://localhost:8000/api/v1/users/register




// Exporting the app instance for use in other parts of the application
export { app };

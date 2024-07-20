// Import the connectDB function from the DATABASE.js file in the DB directory
import connectDB from "./DB/DATABASE.js";

// Import the dotenv package
import dotenv from "dotenv"

// Import the app from app.js
import {app} from './app.js'
// Configure dotenv to load environment variables from a specific file
dotenv.config({
    path: './.env'  // The path to the .env file which contains environment variables
})

// Call the connectDB function to establish a connection to the database
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})









































/* 
import express from "express";
import mongoose from "mongoose";
import { DB_NAME } from "./constant";

// Initialize the Express application
const app = express();

// Use an IIFE (Immediately Invoked Function Expression) to handle asynchronous operations
(async () => {
    try {
        // Connect to MongoDB using mongoose, with the connection string formed using environment variables
        await mongoose.connect(`${process.env.MONGO_DB}/${DB_NAME}`);
        
        // Set up an error event listener on the Express app
        app.on("error", (error) => {
            console.log("error", error);
            throw error; // Throw error to be caught by the catch block
        });

        // Start the Express server and listen on the port defined in environment variables
        app.listen(process.env.PORT, () => {
            console.log(`app is running on ${process.env.PORT}`);
        });
    } catch (error) {
        // Log any errors that occur during the connection or server setup
        console.error("error", error);
        throw error; // Rethrow the error for further handling if needed
    }
})();
 */
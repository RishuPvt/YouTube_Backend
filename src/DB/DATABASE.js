// Import the mongoose module for connecting to MongoDB
import mongoose from "mongoose";

// Import the database name from a constants file
import { DB_NAME } from "../constant.js";

// Define an asynchronous function to connect to the MongoDB database
const connectDB = async () => {
    try {
        // Attempt to connect to the MongoDB database using the connection string
        // The connection string is composed of the environment variable MONGO_DB and the database name
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB}${DB_NAME}`);

        // Log a success message indicating the database host
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        // Log an error message if the connection fails
        console.log("MONGODB connection FAILED ", error);

        // Exit the process with a failure code (1) if the connection fails
        process.exit(1);
    }
}

// Export the connectDB function as the default export of the module
export default connectDB;
 
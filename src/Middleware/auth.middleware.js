import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../Models/User.Model.js";

// Middleware function to verify JWT and authenticate user
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Retrieve the token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        // Check if token is not present
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        // Find the user by ID from the decoded token and exclude password and refresh token fields
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        // Check if user does not exist
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        // Attach the user to the request object
        req.user = user;
        // Proceed to the next middleware function
        next();
    } catch (error) {
        // Throw an error if token verification fails
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

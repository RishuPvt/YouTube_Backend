// Import the necessary modules from express, controllers, and middleware
import { Router } from "express"; // Import Router from express to create routes
import {
  registerUser, // Controller function for user registration
  loginUser, // Controller function for user login
  logoutUser, // Controller function for user logout
  refreshAccessToken, // Controller function for refreshing access token
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  updateAccountDetails,
} from "../Controllers/users.controller.js"; // Import user-related controller functions
import { upload } from "../Middleware/Multer.middleware.js"; // Import multer middleware for handling file uploads
import { verifyJWT } from "../Middleware/auth.middleware.js"; // Import middleware to verify JSON Web Tokens (JWT) for protected routes

// Create a new router instance
const router = Router();

// Route for user registration (POST /register)
// This route handles file uploads for avatar and coverImage using multer middleware
router.route("/register").post(
  upload.fields([
    {
      name: "avatar", // Field name in the form for uploading avatar
      maxCount: 1, // Limit to 1 avatar file per request
    },
    {
      name: "coverImage", // Field name in the form for uploading coverImage
      maxCount: 1, // Limit to 1 cover image file per request
    },
  ]),
  registerUser, // After files are uploaded, call the registerUser controller to handle user registration
);

// Route for user login (POST /login)
// This route handles user login by calling the loginUser controller
router.route("/login").post(loginUser);

// Secured routes (require JWT authentication)

// Route for user logout (POST /logout)
// This route is protected with the verifyJWT middleware, ensuring only authenticated users can log out
router.route("/logout").post(verifyJWT, logoutUser);

// Route for refreshing access tokens (POST /refresh-token)
// This route allows users to refresh their access tokens, no authentication required as it's based on the refresh token
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
// POST /change-password
// This route is for allowing authenticated users to change their current password.
// The 'verifyJWT' middleware ensures the user is logged in and authenticated before the password change.
// The 'changeCurrentPassword' controller handles the logic for updating the password in the database.

router.route("/current-user").get(verifyJWT, getCurrentUser);
// GET /current-user
// This route allows authenticated users to retrieve their current profile information.
// The 'verifyJWT' middleware ensures only authenticated users can access this route.
// The 'getCurrentUser' controller returns the user's current data (like username, email, etc.).

router.route("/update-account").patch(verifyJWT, updateAccountDetails);
// PATCH /update-account
// This route allows authenticated users to update specific account details (like username, email, etc.).
// 'verifyJWT' middleware ensures the user is authenticated.
// 'updateAccountDetails' controller updates the user's information in the database.

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// PATCH /avatar
// This route is for authenticated users to update their profile avatar.
// The 'upload.single("avatar")' middleware handles file uploads, allowing users to upload an image file for the avatar.
// The 'updateUserAvatar' controller stores or updates the avatar URL in the user's profile.

router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
// PATCH /cover-image
// This route allows authenticated users to upload or update their cover image.
// The 'upload.single("coverImage")' middleware handles the image file upload.
// The 'updateUserCoverImage' controller updates the user's cover image in the database.

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
// GET /c/:username
// This route retrieves the public profile (or channel) of a specific user based on their username.
// The ':username' parameter is a dynamic route that extracts the username from the URL.
// The 'verifyJWT' middleware ensures the user requesting the profile is authenticated.
// 'getUserChannelProfile' controller returns the profile information associated with the given username.

router.route("/history").get(verifyJWT, getWatchHistory);
// GET /history
// This route allows authenticated users to access their watch history.
// 'verifyJWT' middleware ensures the user is authenticated before fetching the history.
// 'getWatchHistory' controller retrieves and returns the user's video watch history.

// Export the router to be used in the main app
export default router;

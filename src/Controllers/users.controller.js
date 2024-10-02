import { asyncHandler } from "../Utils/asynchandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/User.Model.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

// Function to generate access and refresh tokens for a user
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    // Throw an error if something goes wrong
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

// Function to register a new user
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  // Extract user details from the request body
  const { fullName, email, username, password } = req.body;

  // Validate that none of the required fields are empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if a user with the provided username or email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Check if an avatar file was uploaded
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Check if a cover image file was uploaded
  // const coverImageLocalPath = req.files.coverImage[0].path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Upload the avatar file to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload the cover image file to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Create a new user object and save it to the database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Find the newly created user and exclude the password and refresh token fields from the response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // Check if the user was successfully created
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Return the created user in the response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

// Function to log in a user
// Define the loginUser function to handle user login, wrapped with asyncHandler for error handling
const loginUser = asyncHandler(async (req, res) => {
  // Extract login details (email, username, password) from the request body
  const { email, username, password } = req.body;
  console.log(email, username, password); // Log the login details (for debugging purposes)

  // Validate that either a username or email is provided
  if (!username && !email) {
    // If neither is provided, throw a 400 Bad Request error
    throw new ApiError(400, "Username or email is required");
  }

  // Find the user by either username or email in the database
  const user = await User.findOne({
    $or: [{ username }, { email }], // Search for a user with a matching username OR email
  });

  // If the user doesn't exist, throw a 404 Not Found error
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Validate the provided password using a method on the user schema (assuming isPasswordCorrect is a custom method)
  const isPasswordValid = await user.isPasswordCorrect(password);

  // If the password is invalid, throw a 401 Unauthorized error
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user password");
  }

  // Generate both access and refresh tokens for the authenticated user
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );

  // Fetch the user's data again, excluding the password and refreshToken fields from the returned object
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // Set cookie options for security
  const options = {
    httpOnly: true, // Ensures the cookie cannot be accessed by client-side JavaScript
    secure: true, // Ensures the cookie is only sent over HTTPS (useful for production environments)
  };

  // Return the logged-in user's data along with the access and refresh tokens, setting them as cookies
  return res
    .status(200) // Set the HTTP status code to 200 (OK), indicating successful login
    .cookie("accessToken", accessToken, options) // Set the accessToken in a cookie
    .cookie("refreshToken", refreshToken, options) // Set the refreshToken in a cookie
    .json(
      new ApiResponse(
        200, // Status code 200 (OK)
        {
          user: loggedInUser, // Return the user's data excluding password and refresh token
          accessToken, // Include the accessToken in the response body
          refreshToken, // Include the refreshToken in the response body
        },
        "User logged In Successfully", // Send a success message
      ),
    );
});

// Define the logoutUser function to handle user logout, wrapped in asyncHandler for error handling
const logoutUser = asyncHandler(async (req, res) => {
  // Find the user by their ID (retrieved from the request object) and remove the 'refreshToken' field from the user document
  await User.findByIdAndUpdate(
    req.user._id, // The user's ID is obtained from req.user._id (assuming it's populated after authentication)
    {
      $unset: {
        refreshToken: 1, // $unset operator removes the 'refreshToken' field from the user's document in the database
      },
    },
    {
      new: true, // The option to return the updated user document after the refreshToken has been removed
    },
  );

  // Set the options for clearing cookies (used when clearing tokens from the browser)
  const options = {
    httpOnly: true, // Ensures the cookie is only accessible via HTTP(S), not by client-side JavaScript (for security)
    secure: true, // Ensures the cookie is sent only over HTTPS (in production)
  };

  // Clear 'accessToken' and 'refreshToken' cookies and send a response
  return res
    .status(200) // Set the HTTP status code to 200 (OK), indicating a successful operation
    .clearCookie("accessToken", options) // Clear the 'accessToken' cookie using the defined options
    .clearCookie("refreshToken", options) // Clear the 'refreshToken' cookie as well
    .json(new ApiResponse(200, {}, "User logged out")); // Respond with a JSON object indicating the user has logged out
});

// Define the refreshAccessToken function to handle access token refreshing, wrapped with asyncHandler for error handling
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get the incoming refresh token either from cookies or from the request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // If no refresh token is provided, throw a 401 Unauthorized error
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request"); // User is not authenticated without a refresh token
  }

  try {
    // Verify the incoming refresh token using JWT and the secret key from the environment variables
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    // Find the user in the database using the decoded token's user ID
    const user = await User.findById(decodedToken?._id);

    // If no user is found, throw a 401 Unauthorized error
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Check if the incoming refresh token matches the user's stored refresh token
    if (incomingRefreshToken !== user?.refreshToken) {
      // If the tokens don't match, throw a 401 error indicating that the token is expired or has already been used
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Set options for cookie security (httpOnly and secure for security purposes)
    const options = {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: true, // Ensures the cookie is only sent over HTTPS (for production environments)
    };

    // Generate new access and refresh tokens for the user
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    // Return the new access token and refresh token in both cookies and JSON response
    return res
      .status(200) // Set HTTP status code to 200 (OK), indicating successful token refresh
      .cookie("accessToken", accessToken, options) // Set the new accessToken as a cookie
      .cookie("refreshToken", newRefreshToken, options) // Set the new refreshToken as a cookie
      .json(
        new ApiResponse(
          200, // Status code 200 (OK)
          { accessToken, refreshToken: newRefreshToken }, // Return the new tokens in the response
          "Access token refreshed", // Success message for the response
        ),
      );
  } catch (error) {
    // Catch any errors that occur during token verification or generation
    // Throw a 401 error with a message (either from the caught error or a default message)
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Handler to change the current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Find the user by ID
  const user = await User.findById(req.user?._id);

  // Check if the old password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    // Throw error if the old password is incorrect
    throw new ApiError(400, "Invalid old password");
  }

  // Update the password and save the user without validation
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  // Send success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Handler to get the current logged-in user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// Handler to update account details (full name and email)
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    // Throw error if required fields are missing
    throw new ApiError(400, "All fields are required");
  }

  // Find the user by ID and update full name and email
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }, // Return the updated user
  ).select("-password"); // Exclude password from the result

  // Send success response with updated user details
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Handler to update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    // Throw error if avatar file is missing
    throw new ApiError(400, "Avatar file is missing");
  }

  // Delete old avatar image from Cloudinary
  // Get the user from the database
  const userAvtarDelete = await User.findById(req.user?._id);

  if (userAvtarDelete.avatar) {
    // Extract the public ID from the existing avatar URL
    const publicId = userAvtarDelete.avatar.split("/").pop().split(".")[0]; // Adjust this based on your Cloudinary setup
    //Use the cloudinary.uploader.destroy() method, passing the public ID of the old image to delete it.
    await cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        throw new ApiError(500, "Error while deleting old avatar");
      }
    });
  }
  // Upload new avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    // Throw error if Cloudinary upload fails
    throw new ApiError(400, "Error while uploading avatar");
  }

  // Update user with new avatar URL
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }, // Return the updated user
  ).select("-password"); // Exclude password from the result

  // Send success response with updated user details
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

// Handler to update user cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    // Throw error if cover image file is missing
    throw new ApiError(400, "Cover image file is missing");
  }

  //Delete old cover image from Cloudinary
  // Get the user from the database
  const DeleteUserCoverImage = await User.findById(req.user?._id);
  // If the user already has an coverImage, delete the old coverImage from Cloudinary
  if (DeleteUserCoverImage.coverImage) {
    // Extract the public ID from the existing avatar URL
    const publicId = DeleteUserCoverImage.coverImage
      .split("/")
      .pop()
      .split(".")[0]; // Adjust this based on your Cloudinary setup
    //Use the cloudinary.uploader.destroy() method, passing the public ID of the old image to delete it.
    await cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        throw new ApiError(500, "Error while deleting old coverImage");
      }
    });
  }

  // Upload new cover image to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    // Throw error if Cloudinary upload fails
    throw new ApiError(400, "Error while uploading cover image");
  }

  // Update user with new cover image URL
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }, // Return the updated user
  ).select("-password"); // Exclude password from the result

  // Send success response with updated user details
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

// Function to get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  // Destructure the username from request parameters
  const { username } = req.params;

  // Check if the username exists and is not just empty/whitespace
  if (!username?.trim()) {
      // If the username is missing or invalid, throw an error with status 400 (Bad Request)
      throw new ApiError(400, "username is missing");
  }

  // Aggregate query to retrieve user channel information
  const channel = await User.aggregate([
      {
          // Match the user by their username (convert to lowercase to make it case-insensitive)
          $match: {
              username: username?.toLowerCase()
          }
      },
      {
          // Perform a lookup to get all subscriptions where this user is the channel
          $lookup: {
              from: "subscriptions",            // The collection to join with (subscriptions)
              localField: "_id",                // The local field in the user collection (_id)
              foreignField: "channel",          // The field in the subscriptions collection (channel) to join on
              as: "subscribers"                 // Store the result of the lookup in the "subscribers" field
          }
      },
      {
          // Perform a lookup to get all channels this user is subscribed to (where they are the subscriber)
          $lookup: {
              from: "subscriptions",            // Join with the subscriptions collection again
              localField: "_id",                // Use the user's _id
              foreignField: "subscriber",       // Match it with the subscriber field in subscriptions
              as: "subscribedTo"                // Store the result in the "subscribedTo" field
          }
      },
      {
          // Add calculated fields to the document
          $addFields: {
              // Count the number of subscribers by taking the size of the "subscribers" array
              subscribersCount: {
                  $size: "$subscribers"
              },
              // Count how many channels this user is subscribed to (from the "subscribedTo" array)
              channelsSubscribedToCount: {
                  $size: "$subscribedTo"
              },
              // Determine if the requesting user is subscribed to this channel (check if their ID exists in the subscribers array)
              isSubscribed: {
                  $cond: {
                      if: { $in: [req.user?._id, "$subscribers.subscriber"] },  // Check if the current user's ID is in the subscribers list
                      then: true,   // If found, set isSubscribed to true
                      else: false   // Otherwise, set it to false
                  }
              }
          }
      },
      {
          // Select only the specific fields we want to return in the response
          $project: {
              fullName: 1,                   // Include full name
              username: 1,                   // Include username
              subscribersCount: 1,           // Include the number of subscribers
              channelsSubscribedToCount: 1,  // Include the count of channels the user is subscribed to
              isSubscribed: 1,               // Include the isSubscribed field
              avatar: 1,                     // Include user's avatar
              coverImage: 1,                 // Include user's cover image
              email: 1                       // Include user's email (sensitive information, consider limiting its use)
          }
      }
  ]);

  // If no channel was found for the given username, throw a 404 error
  if (!channel?.length) {
      throw new ApiError(404, "channel does not exist");
  }

  // Respond with status 200 (OK) and return the channel profile data along with a success message
  return res
      .status(200)
      .json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  // Retrieve the user from the database using MongoDB aggregation pipeline
  const user = await User.aggregate([
      {
          // Step 1: Match the user by their unique ID, which is extracted from the authenticated request (req.user._id)
          $match: {
              _id: new mongoose.Types.ObjectId(req.user._id)
          }
      },
      {
          // Step 2: Use $lookup to join the 'videos' collection with the user's 'watchHistory' field
          // This creates a relationship between the 'watchHistory' array of ObjectIds and the 'videos' collection
          $lookup: {
              from: "videos",  // The 'videos' collection to join with
              localField: "watchHistory",  // The user's 'watchHistory' array (contains video ObjectIds)
              foreignField: "_id",  // The '_id' field of the 'videos' collection (the ObjectId of videos)
              as: "watchHistory",  // Name of the new field in the result containing the matched 'videos'
              
              // Optional: Add a pipeline to further process the 'videos' collection data
              pipeline: [
                  {
                      // Perform a nested $lookup to join the 'users' collection with the 'owner' field in each video
                      // 'owner' is the reference to the user who uploaded the video
                      $lookup: {
                          from: "users",  // The 'users' collection to join with
                          localField: "owner",  // The 'owner' field in the 'videos' collection (the user who owns the video)
                          foreignField: "_id",  // The '_id' field of the 'users' collection (user ObjectId)
                          as: "owner",  // Name of the new field in the result containing the matched 'users'

                          // Optional: Use the $project stage to include only certain fields (fullName, username, avatar) from the 'users'
                          pipeline: [
                              {
                                  $project: {
                                      fullName: 1,  // Include the user's full name
                                      username: 1,  // Include the user's username
                                      avatar: 1     // Include the user's avatar (profile image)
                                  }
                              }
                          ]
                      }
                  },
                  {
                      // Flatten the 'owner' array by taking the first element (since it should contain a single user)
                      // After $lookup, 'owner' is an array; $first converts it to an object with the first item from the array
                      $addFields: {
                          owner: {
                              $first: "$owner"
                          }
                      }
                  }
              ]
          }
      }
  ])

  // Return the user's watch history along with a success message as a JSON response
  return res
      .status(200)  // Send HTTP status 200 to indicate a successful request
      .json(
          new ApiResponse(
              200,  // Status code
              user[0].watchHistory,  // Send the 'watchHistory' data of the user from the first document in the result
              "Watch history fetched successfully"  // Message to return along with the data
          )
      )
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateUserCoverImage,
  updateUserAvatar,
  getCurrentUser,
  updateAccountDetails,
  getUserChannelProfile,
  getWatchHistory
};

//to test the code on postman
/* const registerUser=asyncHandler( async (req , res )=>{
    res.status(200).json({
        message:"ok"
    })
})
 */

// validation - not empty
/* if(fullName===""){
    throw new ApiError(400,"FullName is Req")
} */

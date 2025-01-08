import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asynchandler.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";
import { Tweet } from "../Models/Tweet.model.js";

//handler to create tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  console.log(content);

  if (!content) {
    throw new ApiError(400, "content field is req");
  }
  const mediaLocalPath = req.file?.path;
  //   console.log(mediaLocalPath);

  let mediaUrl = null;

  if (mediaLocalPath) {
    const media = await uploadOnCloudinary(mediaLocalPath, "image"); // Use a dedicated folder for tweets
    if (!media || !media.url) {
      throw new ApiError(500, "Error while uploading media");
    }
    mediaUrl = media.url;
    // console.log(mediaUrl);
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
    media: mediaUrl,
  });
  return res.status(200).json(new ApiResponse(200, tweet, "tweet succefully"));
});

// TODO: get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const tweet = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

  if (!tweet.length) {
    throw new ApiError(404, "No tweets found for the user");
  }

  return res.status(200).json(
    new ApiResponse(200, "User tweets retrieved successfully", {
      tweet,
    }),
  );
});

//TODO: update tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "content field is req");
  }
  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user.id) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }
  if (content) tweet.content = content;

  if (req.file?.path) {
    const media = await uploadOnCloudinary(req.file.path, "image");
    if (!media || !media.url) {
      throw new ApiError(500, "Error while uploading media");
    }
    tweet.media = media.url;
  }

  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
});

//TODO: delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", tweet));
});

const getAllTweets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const tweet = await Tweet.find()
    .populate("owner", "username fullName")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  if (!tweet.length) {
    throw new ApiError(404, "No tweets found");
  }

  const totalTweets = await Tweet.countDocuments();
  const totalPages = Math.ceil(totalTweets / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tweet,
        totalTweets,
        totalPages,
        currentPage: parseInt(page),
      },
      "All tweets retrieved successfully",
    ),
  );
});
 
export { createTweet, getUserTweets, updateTweet, deleteTweet, getAllTweets };

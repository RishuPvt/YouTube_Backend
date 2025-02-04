import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asynchandler.js";
import { Tweet } from "../Models/Tweet.model.js";

//Handler : toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video not found");
  }

  const likedVideo = await Like.findOne({ video: videoId, likedBy: userId });

  if (likedVideo) {
    await Like.findByIdAndDelete(likedVideo._id);
    return res.status(200).json(new ApiResponse(200, videoId, "video unliked"));
  } else {
    const newLike = await Like.create({ video: videoId, likedBy: userId });
    return res.status(200).json(new ApiResponse(200, videoId, "video liked"));
  }
});

//Handler : toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  const comment = await Video.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "comment not found");
  }
  const commentLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (commentLike) {
    await Like.findByIdAndDelete(commentLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, commentId, "comment disliked"));
  } else {
    const newLike = new Like({ comment: commentId, likedBy: userId });
    await newLike.save();
    return res
      .status(200)
      .json(new ApiResponse(200, commentId, "comment liked"));
  }
});

//Handler: toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "tweet not found");
  }

  const tweetLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (tweetLike) {
    await Like.findByIdAndDelete(tweetLike._id);
    return res.status(200).json(new ApiResponse(200, tweetId, "tweet dislike"));
  } else {
    const newLike = await Like.create({ tweet: tweetId, likedBy: userId });
    return res.status(200).json(new ApiResponse(200, tweetId, "tweet liked"));
  }
});

//Handler: Get all liked Video of user
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const likedVideos = await Like.find({ likedBy: userId }).populate("video");

  res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully"),
    );
});

//Handler: Get all liked Tweet of user
const getLikedTweets = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const likedVideos = await Like.find({ likedBy: userId }).populate("tweet");

  res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked Tweet fetched successfully"),
    );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getLikedTweets,
};

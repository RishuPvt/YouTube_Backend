import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";
import { User } from "../Models/User.Model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../Utils/asynchandler.js";

// Handler to get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  console.log(req.body);

  if (!title && !description) {
    throw new ApiError(400, " title and description field is requird");
  }
  console.log("Uploaded files: ", req.files);
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file is required");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(400, "thumbnail file is required");
  }
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "video file is required");
  }
  const videoFile = await uploadOnCloudinary(videoLocalPath, "video");
  if (!videoFile) {
    throw new ApiError(400, "video file is required");
  }
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video uploaded and created successfully"),
    );
});

//Hanler to get Allvideo by id
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

//Hanler to get video by id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video found succusfully"));
});

// update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const { title, description } = req.body;
  console.log(req.body);

  if (!title || !description) {
    throw new ApiError(400, "Any one field is req for update");
  }

  const thumbnailLocalPath = req.file?.path;
  //console.log(thumbnailLocalPath);

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file is missing");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  //console.log(thumbnail);

  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading thumbnail");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video details updated successfully"),
    );
});

//Handler to delete video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  return res.status(200).json(
    new ApiResponse(200, video, "video deleted successfully"),
  );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

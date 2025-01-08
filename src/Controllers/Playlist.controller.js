import { Playlist } from "../Models/Playlist.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asynchandler.js";

//create playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(404, "Please provide both name and description");
  }

  const existingPlaylist = await Playlist.findOne({ name, user: req.user._id });
  if (existingPlaylist) {
    throw new ApiError(404, "Playlist with this name already exists");
  }

  const playlist = await Playlist.create({
    owner: req.user._id,
    name,
    description,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

//get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const playlists = await Playlist.find({ owner: userId });

  if (!playlists || playlists.length === 0) {
    throw new ApiError(404, "No playlists found for this user");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists retrieved successfully"),
    );
});

// get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const playlists = await Playlist.findById(playlistId);

  if (!playlists) {
    throw new ApiError(404, "No playlists found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlist retrieved successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { playlistId } = req.body;

  if (!playlistId || !videoId) {
    throw new ApiError(404, "Please provide both playlistId and videoId");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $push: { videos: videoId } },
    { new: true },
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully",
      ),
    );
});

// remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }
  if (!videoId || !playlistId) {
    throw new ApiError(404, "both videoId and PlaylistId req");
  }
  const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or user not authorized");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } }, // $pull removes the specified value from the array
    { new: true },
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Failed to update playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed succesfully"));
});

// TODO: delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

//update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(404, "Please provide name or description");
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: updateFields,
    },
    {
      new: true,
    },
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Playlist details updated successfully"),
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};

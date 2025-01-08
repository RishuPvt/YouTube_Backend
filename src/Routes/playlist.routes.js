import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  addVideoToPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../Controllers/Playlist.controller.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";
const router = Router();

router.route("/createPlaylist").post(verifyJWT, createPlaylist);
router.route("/getPlaylistById/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/getUserPlaylists/:userId").get(verifyJWT, getUserPlaylists);
router
  .route("/removeVideoFromPlaylist/:playlistId")
  .delete(verifyJWT, removeVideoFromPlaylist);
router
  .route("/addVideoToPlaylist/:videoId")
  .patch(verifyJWT, addVideoToPlaylist);
router.route("/deletePlaylist/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/updatePlaylist/:playlistId").put(verifyJWT, updatePlaylist);

export default router;

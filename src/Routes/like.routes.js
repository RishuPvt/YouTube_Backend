import { Router } from "express";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getLikedTweets
} from "../Controllers/Like.controller.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";

const router = Router();

router.route("/toggleTweetLike/:tweetId").post(verifyJWT, toggleTweetLike);
router.route("/toggleCommentLike/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/toggleVideoLike/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/getLikedVideos").get(verifyJWT, getLikedVideos);
router.route("/getLikedTweets").get(verifyJWT, getLikedTweets);



export default router;

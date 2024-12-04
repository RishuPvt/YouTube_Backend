import { Router } from "express";
import { createTweet ,getUserTweets, updateTweet, deleteTweet , getAllTweets} from "../Controllers/tweet.controller.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";
import { upload } from "../Middleware/Multer.middleware.js";
const router = Router();

router
  .route("/createTweet")
  .post(verifyJWT, upload.single("media"), createTweet);
router.route("/getUserTweets").get(verifyJWT ,getUserTweets)
router.route("/updateTweet/:tweetId").patch(verifyJWT , upload.single("media"),updateTweet)
router.route("/deleteTweet/:tweetId").delete(verifyJWT ,deleteTweet)
router.route("/getAllTweets").get(verifyJWT , getAllTweets)


export default router;

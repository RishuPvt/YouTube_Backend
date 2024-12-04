import { Router } from "express";
import { verifyJWT } from "../Middleware/auth.middleware.js";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../Controllers/video.controller.js";
import { upload } from "../Middleware/Multer.middleware.js";
const router = Router();

router.route("/getAllVideos").get(getAllVideos);
router.route("/publishAVideo").post(
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "videoFile",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  publishAVideo,
);
router.route("/getVideoById/:videoId").get(getVideoById);
router.route("/updateVideo/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo );
router.route("/deleteVideo/:videoId").delete(verifyJWT, deleteVideo);
router.route("/togglePublish/:videoId").patch(verifyJWT, togglePublishStatus);
router.route("/getAllVideos").get(verifyJWT , getAllVideos)

export default router;

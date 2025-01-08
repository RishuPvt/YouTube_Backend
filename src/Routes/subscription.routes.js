import { Router } from "express";
import {subscribeToChannel,unsubscribeFromChannel, getSubscribedChannels , getUserChannelSubscribers ,getSubscriberCount } from "../Controllers/Subscription.controller.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";
const router= Router()

router.route("/subscribeToChannel").post(verifyJWT , subscribeToChannel)
router.route("/unsubscribeFromChannel").post(verifyJWT , unsubscribeFromChannel)
router.route("/getSubscribedChannels/:channelId").get(verifyJWT ,getSubscribedChannels )
router.route("/getUserChannelSubscribers/:subscriberId").get(verifyJWT ,getUserChannelSubscribers )
router.route("/getSubscriberCount/:channelId").get(verifyJWT ,getSubscriberCount)


export default router;
import { Router } from "express";
import { getSubscribedChannels , getUserChannelSubscribers ,toggleSubscription } from "../Controllers/Subscription.controller";
import { verifyJWT } from "../Middleware/auth.middleware";
const router= Router()


export default router;
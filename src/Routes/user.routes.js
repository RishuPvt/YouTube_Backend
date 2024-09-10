import { Router } from "express";
import { 
    registerUser , 
    loginUser, 
    logoutUser, 
} from "../Controllers/users.controller.js";
import {upload} from "../Middleware/Multer.middleware.js"
import { verifyJWT } from "../Middleware/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

    router.route("/login").post(loginUser)

    //secured routes
    router.route("/logout").post(verifyJWT,  logoutUser)


export default router
import { Router } from "express";
import { registerUser } from "../Controllers/users.controller.js";

const router = Router()

router.route("/register").post(registerUser)



export default router
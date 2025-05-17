import { Router } from "express";
import { loginUser, refreshToken, registerUser } from "./controller";

export const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh").get(refreshToken);

import { Router } from "express";
import {
  getUserInfo,
  loginUser,
  logout,
  refreshToken,
  registerUser,
} from "./controller";

export const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh").get(refreshToken);
router.route("/logout").get(logout);
router.route("/user-info").get(getUserInfo);

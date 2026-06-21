import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(registerUser); // register new user
router.route("/login").post(loginUser); // login new user
router.route("/logout").post(logoutUser); // logout the curr user
router.route("/me").get(protect, getCurrentUser); // get own details

export default router;

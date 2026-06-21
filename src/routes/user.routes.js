import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  getMyProfile,
  getUserProfile,
  updateProfile,
  updateAvatar,
  updateCoverImage,
  searchUsers,
  uploadAvatar,
  uploadCoverImage,
} from "../controllers/user.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.route("/search").get(protect, searchUsers);

router
  .route("/profile")
  .get(protect, getMyProfile)
  .patch(protect, updateProfile);

router.route("/avatar").patch(protect, updateAvatar);

router.route("/cover").patch(protect, updateCoverImage);
router.patch(
  "/cover-image",
  protect,
  upload.single("coverImage"),
  uploadCoverImage
);

router.route("/:id").get(protect, getUserProfile);

router.patch("/uploadavatar", protect, upload.single("avatar"), uploadAvatar);
export default router;

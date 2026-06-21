import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} from "../controllers/posts.controller.js";

const router = express.Router();

router.route("/").post(protect, createPost);

router.route("/feed").get(protect, getFeed);

router
  .route("/:id")
  .get(protect, getPostById)
  .patch(protect, updatePost)
  .delete(protect, deletePost);

router.route("/:id/like").post(protect, likePost).delete(protect, unlikePost);

export default router;

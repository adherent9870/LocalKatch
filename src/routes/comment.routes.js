import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

// Post Comments
router
  .route("/posts/:postId/comments")
  .post(protect, createComment)
  .get(protect, getPostComments);

// Single Comment
router
  .route("/:id")
  .patch(protect, updateComment)
  .delete(protect, deleteComment);

export default router;

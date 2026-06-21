import mongoose from "mongoose";

import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getPagination } from "../utils/Pagination.js";

/**
 *  Create a Comment
 */
export const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not Found");
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content,
  });

  await Post.findByIdAndUpdate(postId, {
    $inc: {
      commentsCount: 1,
    },
  });
  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully"));
  // res.status(201).json({
  //   success: true,
  //   message: "Comment created successfully",
  //   data: comment,
  // });
});

/**
 *  Get Comments
 */
export const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  const { page, limit, skip } = getPagination(req);
  //   const page = Number(req.query.page) || 1;

  // const limit = Math.min(Number(req.query.limit) || 10, 50);

  // const skip = (page - 1) * limit;

  const totalComments = await Comment.countDocuments({
    post: postId,
  });

  const comments = await Comment.find({
    post: postId,
  })
    .populate("author", "name username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        pagination: {
          currentPage: page,
          limit,
          totalComments,
          totalPages: Math.ceil(totalComments / limit),
        },
      },
      "Comments fetched successfully"
    )
  );
});
// export const getPostComments = asyncHandler(async (req, res) => {
//   const { postId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(postId)) {
//     throw new ApiError(400, "Invalid Post ID");
//   }

//   const comments = await Comment.find({
//     post: postId,
//   })
//     .populate("author", "name username avatar")
//     .sort({ createdAt: -1 });

//   res
//     .status(200)
//     .json(new ApiResponse(200, { count: comments.length, data: comments }));
//   // res.status(200).json({
//   //   success: true,
//   //   count: comments.length,
//   //   data: comments,
//   // });
// });

/**
 *  Update COmment
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not Authorized");
  }

  comment.content = content;
  comment.isEdited = true;

  await comment.save();

  res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successsfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Comment updated successfully",
  //   data: comment,
  // });
});

/*
 *   Delete COmment
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, "Comment not Found");
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not Authorized");
  }

  await Post.findByIdAndUpdate(comment.post, {
    $inc: {
      commentsCount: -1,
    },
  });

  await comment.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Comment deleted successfully",
  // });
});

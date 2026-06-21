import mongoose from "mongoose";

import Post from "../models/Post.js";
import PostLike from "../models/PostLike.js";
import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getPagination } from "../utils/Pagination.js";
/**
 * create a post
 */
export const createPost = asyncHandler(async (req, res) => {
  const { content, images, communityId } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Post content is required");
  }

  if (communityId) {
    const community = await Community.findById(communityId);

    if (!community) {
      throw new ApiError(404, "community not found");
    }

    const membership = await CommunityMember.findOne({
      community: communityId,
      user: req.user._id,
    });

    if (!membership) {
      throw new ApiError(403, "You are not a member of this community");
    }
  }

  const post = await Post.create({
    author: req.user._id,
    content,
    images,
    community: communityId || null,
  });

  if (communityId) {
    await Community.findByIdAndUpdate(communityId, {
      $inc: { postsCount: 1 },
    });
  }

  res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
  // res.status(201).json({
  //   success: true,
  //   message: "Post created successfully",
  //   data: post,
  // });
});

/**
 *  Get All Posts/feeds
 */

export const getFeed = asyncHandler(async (req, res) => {
  // //get the page no. and limit from query
  // const page = Number(req.query.page) || 1;
  // const limit = Number(req.query.limit) || 10;

  // const skip = (page - 1) * limit;

  const { page, limit, skip } = getPagination(req);
  const posts = await Post.find()
    .populate("author", "name username avatar")
    .populate("community", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        pagination: {
          currentPage: page,
          limit,
          totalPosts,
          totalPages: Math.ceil(totalPosts / limit),
        },
      },
      "Posts fetched successfully"
    )
  );

  // res
  //   .status(200)
  //   .json(
  //     new ApiResponse(
  //       200,
  //       { count: posts.length, data: posts },
  //       "Get the feeds"
  //     )
  //   );
  // res.status(200).json({
  //   success: true,
  //   count: posts.length,
  //   data: posts,
  // });
});

/*
 *  Get Post By ID
 */

export const getPostById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const post = await Post.findById(req.params.id)
    .populate("author", "name username avatar bio")
    .populate("community", "name avatar");

  if (!post) {
    throw new ApiError(404, "Post not Found");
  }

  res.status(200).json(new ApiResponse(200, post, "Post data"));
  // res.status(200).json({
  //   success: true,
  //   data: post,
  // });
});

/**
 *  Update Post
 */
export const updatePost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not Found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "not authorized");
  }

  post.content = content;
  post.isEdited = true;

  await post.save();

  res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Post updated successfully",
  //   data: post,
  // });
});

/**
 *  Delete Post
 */

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not Found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Not Authorized");
  }

  await PostLike.deleteMany({
    post: post._id,
  });

  if (post.community) {
    await Community.findByIdAndUpdate(post.community, {
      $inc: {
        postsCount: -1,
      },
    });
  }

  await post.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, "deleted", "Post Deleted successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Post deleted successfully",
  // });
});

/**
 *  Like a particular post
 */

export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not Found");
  }

  const existingLike = await PostLike.findOne({
    post: post._id,
    user: req.user._id,
  });

  if (existingLike) {
    throw new ApiError(400, "Post already Exist");
  }

  await PostLike.create({
    post: post._id,
    user: req.user._id,
  });

  post.likesCount += 1;

  await post.save();

  res.status(200).json(new ApiResponse(200, post.likesCount, "Post Liked"));
  // res.status(200).json({
  //   success: true,
  //   message: "Post liked",
  // });
});

/**
 *  Unlike a post
 */

export const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not Found");
  }

  const like = await PostLike.findOne({
    post: post._id,
    user: req.user._id,
  });

  if (!like) {
    throw new ApiError(404, "Like not Found");
  }

  await like.deleteOne();

  post.likesCount -= 1;

  await post.save();

  res.status(200).json(new ApiResponse(200, like, "Post unliked"));
  // res.status(200).json({
  //   success: true,
  //   message: "Post unliked",
  // });
});

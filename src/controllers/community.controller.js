import mongoose from "mongoose";
import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getPagination } from "../utils/Pagination.js";

export const createCommunity = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    isPrivate,
    tags,
    rules,
    avatar,
    banner,
  } = req.body;

  if (!name) {
    throw new ApiError(400, "Community name is required");
  }

  const existingCommunity = await Community.findOne({ name });

  if (existingCommunity) {
    throw new ApiError(400, "Community already exists");
  }

  const community = await Community.create({
    name,
    description,
    category,
    isPrivate,
    tags,
    rules,
    avatar,
    banner,
    createdBy: req.user._id,
  });

  await CommunityMember.create({
    community: community._id,
    user: req.user._id,
    role: "owner",
  });

  res
    .status(201)
    .json(new ApiResponse(201, community, "community created successfully"));
  // res.status(201).json({
  //   success: true,
  //   message: "Community created successfully",
  //   data: community,
  // });
});
/* get all communities
 */
export const getAllCommunities = asyncHandler(async (req, res) => {
  const { category, search } = req.query;

  // const page = Number(req.query.page) || 1;
  // const limit = Math.min(Number(req.query.limit) || 10, 50);

  // const skip = (page - 1) * limit;
  const { page, limit, skip } = getPagination(req);

  const query = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query.name = {
      $regex: search,
      $options: "i",
    };
  }

  const totalCommunities = await Community.countDocuments(query);

  const communities = await Community.find(query)
    .populate("createdBy", "name username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        communities,
        pagination: {
          currentPage: page,
          limit,
          totalCommunities,
          totalPages: Math.ceil(totalCommunities / limit),
        },
      },
      "Communities fetched successfully"
    )
  );
});
/**
 * Get community by ID
 *
 */
export const getCommunityById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid Community Id");
  }

  const community = await Community.findById(req.params.id).populate(
    "createdBy",
    "name username avatar"
  );

  if (!community) {
    throw new ApiError(404, "Community Not Found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, community, "get community data successfully"));
  // res.status(200).json({
  //   success: true,
  //   data: community,
  // });
});
/*
    JOin Community
*/
export const joinCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    throw new ApiError(404, "Community Not Found");
  }

  const existingMember = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
  });

  if (existingMember) {
    throw new ApiError(400, "Already a community member");
  }

  await CommunityMember.create({
    community: req.params.id,
    user: req.user._id,
    role: "member",
  });

  community.membersCount += 1;

  await community.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Joined", "Joined community successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Joined community successfully",
  // });
});
/*Leave community

*/
export const leaveCommunity = asyncHandler(async (req, res) => {
  const membership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
  });

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  if (membership.role === "owner") {
    throw new ApiError(400, "Owner Cannot leave community");
  }

  await membership.deleteOne();

  await Community.findByIdAndUpdate(req.params.id, {
    $inc: {
      membersCount: -1,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "left", "Left community successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Left community successfully",
  // });
});

/*
    Get Community Members
*/
export const getCommunityMembers = asyncHandler(async (req, res) => {
  const members = await CommunityMember.find({
    community: req.params.id,
  })
    .populate("user", "name username avatar bio")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: members.length,
        data: members,
      },
      "get community members successfully"
    )
  );
  // res.status(200).json({
  //   success: true,
  //   count: members.length,
  //   data: members,
  // });
});

/*
    update commmunity
*/
export const updateCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    throw new ApiError(404, "Community Not Found");
  }

  if (community.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  const updatedCommunity = await Community.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedCommunity, "community updated successfully")
    );
  // res.status(200).json({
  //   success: true,
  //   message: "Community updated successfully",
  //   data: updatedCommunity,
  // });
});

/*
    Delete Community
*/
export const deleteCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    throw new ApiError(404, "Community Not Found");
  }

  if (community.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not Authorized");
  }

  await CommunityMember.deleteMany({
    community: community._id,
  });

  await community.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, "delete community", "delted Successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Community deleted successfully",
  // });
});

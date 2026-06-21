import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getPagination } from "../utils/Pagination.js";
import uploadToCloudinary, {
  deleteFromCloudinary,
} from "../utils/UploadToCloudinary.js";

/**
 * @desc Get logged-in user's profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).json(new ApiResponse(200, user, "user profile data"));
  // res.status(200).json({
  //   success: true,
  //   data: user,
  // });
});

/**
 * @desc Get public user profile
 * @route GET /api/users/:id
 * @access Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not Found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "get details of public user"));
  // res.status(200).json({
  //   success: true,
  //   data: user,
  // });
});

/**
 * @desc Update profile
 * @route PATCH /api/users/profile
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "bio",
    "college",
    "profession",
    "interests",
    "skills",
    "goals",
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile Updated Successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Profile updated successfully",
  //   data: updatedUser,
  // });
});

/**
 * @desc Update avatar
 * @route PATCH /api/users/avatar
 * @access Private
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;

  if (!avatar) {
    throw new ApiError(400, "Avatar URL is Required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
    }
  ).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar Updated Successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Avatar updated successfully",
  //   data: updatedUser,
  // });
});

/**
 * @desc Update cover image
 * @route PATCH /api/users/cover
 * @access Private
 */
export const updateCoverImage = asyncHandler(async (req, res) => {
  const { coverImage } = req.body;

  if (!coverImage) {
    throw new ApiError(400, "Cover Image URL is required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { coverImage },
    {
      new: true,
    }
  ).select("-password");

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover Image Updated Successfully")
    );
  // res.status(200).json({
  //   success: true,
  //   message: "Cover image updated successfully",
  //   data: updatedUser,
  // });
});

/**
 * @desc Search users
 * @route GET /api/users/search?q=
 * @access Private
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q = "" } = req.query;
  if (!q.trim()) {
    throw new ApiError(400, "Search query is required");
  }
  const { page, limit, skip } = getPagination(req);
  const query = {
    $or: [
      {
        name: {
          $regex: q,
          $options: "i",
        },
      },
      {
        username: {
          $regex: q,
          $options: "i",
        },
      },
    ],
  };
  const totalUsers = await User.countDocuments(query);

  const users = await User.find(query)
    .select("name username avatar bio profession")
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          currentPage: page,
          limit,
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
      "Users fetched successfully"
    )
  );
  // res.status(200).json({
  //   success: true,
  //   count: users.length,
  //   data: users,
  // });
});

/// avatar upload
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar image is required");
  }

  const result = await uploadToCloudinary(req.file.path);

  const currentUser = await User.findById(req.user._id);

  await deleteFromCloudinary(currentUser.avatar.public_id);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    },
    {
      returnDocument: "after",
    }
  ).select("-password");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        avatar: result.secure_url,
        user,
      },
      "Avatar uploaded successfully"
    )
  );
});

export const uploadCoverImage = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Cover Image not found/required");
  }
  const currentUser = await User.findById(req.user._id);
  await deleteFromCloudinary(currentUser.coverImage?.publicId);

  const result = await uploadToCloudinary(req.file.path);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      coverImage: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    },
    {
      returnDocument: "after",
    }
  ).select("-password");
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        coverImage: result.secure_url,
        user,
      },
      "Cover Image uploaded successfully"
    )
  );
};

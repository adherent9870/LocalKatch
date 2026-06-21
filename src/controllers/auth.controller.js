import bcrypt from "bcryptjs";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// register new user
export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(400, "Email or username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json(
    new ApiResponse(
      200,
      {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      "Account created Successfully"
    )
  );
});

// login new user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials, Password Not Match");
  }

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      "Login successful"
    )
  );
});

// logout new user
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res
    .status(200)
    .json(new ApiResponse(200, "Logging out", "Logged out successfully"));
  // res.status(200).json({
  //   success: true,
  //   message: "Logged out successfully",
  // });
});

// get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "current user data"));
  // res.status(200).json({
  //   success: true,
  //   user: req.user,
  // });
});

import mongoose from "mongoose";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Connection from "../models/Connection.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 *  Send Connection Request
 * APi- POST /api/connections/request
 */
export const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    throw new ApiError(400, "Receiver id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (receiverId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot connect with yourself");
  }

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new ApiError(404, "Receiver not found");
  }

  const existingConnection = await Connection.findOne({
    $or: [
      {
        sender: req.user._id,
        receiver: receiverId,
      },
      {
        sender: receiverId,
        receiver: req.user._id,
      },
    ],
  });

  if (existingConnection) {
    throw new ApiError(400, "Connection request already exists");
  }

  const connect = await Connection.create({
    sender: req.user._id,
    receiver: receiverId,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, connect, "Connection request sent successfully")
    );
  // res.status(201).json({
  //   success: true,
  //   message: "Connection request sent successfully",
  //   data: connect,
  // });
});

/**
 * @desc Get Received Requests
 * @route GET /api/connections/received
 * @access Private
 */
export const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await Connection.find({
    receiver: req.user._id,
    status: "pending",
  })
    .populate("sender", "name username avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: requests.length, data: requests },
        "Get Received Request list"
      )
    );
  // res.status(200).json({
  //   success: true,
  //   count: requests.length,
  //   data: requests,
  // });
});

/**
 * @desc Get Sent Requests
 * @route GET /api/connections/sent
 * @access Private
 */
export const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await Connection.find({
    sender: req.user._id,
    status: "pending",
  })
    .populate("receiver", "name username avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: requests.length, data: requests },
        "Get sent Request"
      )
    );
  // res.status(200).json({
  //   success: true,
  //   count: requests.length,
  //   data: requests,
  // });
});

/**
 * @desc Accept Request
 * @route PATCH /api/connections/:id/accept
 * @access Private
 */
export const acceptConnectionRequest = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.id);

  if (!connection) {
    throw new ApiError(404, "Connection request not found");
  }

  if (connection.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  connection.status = "accepted";

  await connection.save();

  res
    .status(200)
    .json(new ApiResponse(200, connection, "Connection request accepted"));
  // res.status(200).json({
  //   success: true,
  //   message: "Connection request accepted",
  //   data: connection,
  // });
});

/**
 * @desc Reject Request
 * @route PATCH /api/connections/:id/reject
 * @access Private
 */
export const rejectConnectionRequest = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.id);

  if (!connection) {
    throw new ApiError(404, "Connection request not found");
  }

  if (connection.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  connection.status = "rejected";

  await connection.save();

  res
    .status(200)
    .json(new ApiResponse(200, connection, "Connection request rejected"));
  // res.status(200).json({
  //   success: true,
  //   message: "Connection request rejected",
  //   data: connection,
  // });
});

/**
 * @desc Cancel Sent Request
 * @route DELETE /api/connections/:id/cancel
 * @access Private
 */
export const cancelConnectionRequest = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.id);

  if (!connection) {
    throw new ApiError(404, "Connection request not found");
  }

  if (connection.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  await connection.deleteOne();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Deleted succesffuly",
        "Connection request cancelled"
      )
    );
  // res.status(200).json({
  //   success: true,
  //   message: "Connection request cancelled",
  // });
});

/**
 * @desc Get My Connections
 * @route GET /api/connections
 * @access Private
 */
export const getMyConnections = asyncHandler(async (req, res) => {
  const connections = await Connection.find({
    $or: [
      {
        sender: req.user._id,
      },
      {
        receiver: req.user._id,
      },
    ],
    status: "accepted",
  })
    .populate("sender", "name username avatar bio profession")
    .populate("receiver", "name username avatar bio profession");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: connections.length,
        data: connections,
      },
      "Get my connection"
    )
  );
  // res.status(200).json({
  //   success: true,
  //   count: connections.length,
  //   data: connections,
  // });
});

/***
 *
 * Remove Friend
 * **/
export const removeConnection = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.id);

  if (!connection) {
    throw new ApiError(404, "Connection not found");
  }

  const isParticipant =
    connection.sender.toString() === req.user._id.toString() ||
    connection.receiver.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw new ApiError(403, "Not authorized");
  }

  await connection.deleteOne();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "removed connection",
        "connection removed successfully"
      )
    );
  // res.status(200).json({
  //   success: true,
  //   message: "Connection removed successfully",
  // });
});

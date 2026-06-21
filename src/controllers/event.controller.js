import mongoose from "mongoose";

import Event from "../models/Event.js";
import EventAttendee from "../models/EventAttendee.js";
import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getPagination } from "../utils/Pagination.js";

/*    Create Event
 *
 */
export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    banner,
    community,
    category,
    startDate,
    endDate,
    location,
    address,
    maxAttendees,
    isPrivate,
  } = req.body;

  if (!title || !startDate || !endDate || !location || !address) {
    throw new ApiError(400, "Required fields are missing");
  }
  if (new Date(startDate) < new Date()) {
    throw new ApiError(400, "Event start date cannot be in the past");
  }
  if (new Date(endDate) < new Date(startDate)) {
    throw new ApiError(400, "End date must be after start date");
  }

  if (community) {
    const membership = await CommunityMember.findOne({
      community,
      user: req.user._id,
    });

    if (!membership) {
      throw new ApiError(403, "You are not a member of this community");
    }
  }

  const event = await Event.create({
    title,
    description,
    banner,
    organizer: req.user._id,
    community,
    category,
    startDate,
    endDate,
    location,
    address,
    maxAttendees,
    isPrivate,
  });

  await EventAttendee.create({
    event: event._id,
    user: req.user._id,
    status: "registered",
  });

  event.attendeesCount = 1;

  await event.save();

  res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
  //   res.status(201).json({
  //     success: true,
  //     message: "Event created successfully",
  //     data: event,
  //   });
});

/**
 *  Get All Events
 *
 */

export const getAllEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);

  const { search, category } = req.query;

  const query = {
    status: "published",
  };

  if (search) {
    query.title = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    query.category = category;
  }

  const totalEvents = await Event.countDocuments(query);

  const events = await Event.find(query)
    .populate("organizer", "name username avatar")
    .populate("community", "name")
    .sort({
      startDate: 1,
    })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        events,
        pagination: {
          currentPage: page,
          limit,
          totalEvents,
          totalPages: Math.ceil(totalEvents / limit),
        },
      },
      "Events fetched successfully"
    )
  );
});

/**
 *  Get Events by ID
 */
export const getEventById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid event id");
  }
  const event = await Event.findById(req.params.id)
    .populate("organizer", "name username avatar")
    .populate("community", "name");

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, event, "Get event data by ID successfully"));
  //   res.status(200).json({
  //     success: true,
  //     data: event,
  //   });
});

/**
 * JOin Event
 */
export const joinEvent = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid event id");
  }
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const existing = await EventAttendee.findOne({
    event: event._id,
    user: req.user._id,
  });

  if (existing) {
    throw new ApiError(400, "Already joined");
  }

  if (event.maxAttendees && event.attendeesCount >= event.maxAttendees) {
    throw new ApiError(400, "Event is full");
  }

  await EventAttendee.create({
    event: event._id,
    user: req.user._id,
  });

  event.attendeesCount += 1;

  await event.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Joined Event", "Joined Event Successfully"));
  //   res.status(200).json({
  //     success: true,
  //     message: "Joined event successfully",
  //   });
});

/**
 *  Leave Event
 */

export const leaveEvent = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid event id");
  }
  const attendee = await EventAttendee.findOne({
    event: req.params.id,
    user: req.user._id,
  });

  if (!attendee) {
    throw new ApiError(404, "Not registered");
  }

  const event = await Event.findById(req.params.id);

  if (event.organizer.toString() === req.user._id.toString()) {
    throw new ApiError(400, "Organizer cannot leave event");
  }

  await attendee.deleteOne();

  event.attendeesCount = Math.max(0, event.attendeesCount - 1);

  await event.save();

  res
    .status(200)
    .json(new ApiResponse(200, "left event", "Left Event Successfully"));
  //   res.status(200).json({
  //     success: true,
  //     message: "Left event successfully",
  //   });
});

/**
 *  Get Attendees
 */
export const getEventAttendees = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid event id");
  }
  const attendees = await EventAttendee.find({
    event: req.params.id,
  }).populate("user", "name username avatar");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: attendees.length, data: attendees },
        "event attendee list successfully"
      )
    );
  //   res.status(200).json({
  //     success: true,
  //     count: attendees.length,
  //     data: attendees,
  //   });
});

/**
 * Update Event
 *
 */
export const updateEvent = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid event id");
  }
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, updated, "event updated successfully"));
  //   res.status(200).json({
  //     success: true,
  //     message: "Event updated successfully",
  //     data: updated,
  //   });
});

/**
 *  Delete Event
 */
export const deleteEvent = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid event id");
  }
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.organizer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  await EventAttendee.deleteMany({
    event: event._id,
  });

  await event.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, "delete Event", "Event deleted successfully"));
  //   res.status(200).json({
  //     success: true,
  //     message: "Event deleted successfully",
  //   });
});

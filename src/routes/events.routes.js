import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventAttendees,
} from "../controllers/event.controller.js";

const router = express.Router();

router.route("/").post(protect, createEvent).get(protect, getAllEvents);

router
  .route("/:id")
  .get(protect, getEventById)
  .patch(protect, updateEvent)
  .delete(protect, deleteEvent);

router.route("/:id/join").post(protect, joinEvent);

router.route("/:id/leave").delete(protect, leaveEvent);

router.route("/:id/attendees").get(protect, getEventAttendees);

export default router;

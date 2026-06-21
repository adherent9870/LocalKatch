import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  sendConnectionRequest,
  getReceivedRequests,
  getSentRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  getMyConnections,
  removeConnection,
} from "../controllers/connection.controller.js";

const router = express.Router();

router.route("/").get(protect, getMyConnections);

router.route("/request").post(protect, sendConnectionRequest);

router.route("/received").get(protect, getReceivedRequests);

router.route("/sent").get(protect, getSentRequests);

router.route("/:id/accept").patch(protect, acceptConnectionRequest);

router.route("/:id/reject").patch(protect, rejectConnectionRequest);

router.route("/:id/cancel").delete(protect, cancelConnectionRequest);

router.route("/:id").delete(protect, removeConnection);
export default router;

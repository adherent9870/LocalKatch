import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updateCommunity,
  deleteCommunity,
} from "../controllers/community.controller.js";

const router = express.Router();

router
  .route("/")
  .post(protect, createCommunity)
  .get(protect, getAllCommunities);

router
  .route("/:id")
  .get(protect, getCommunityById)
  .patch(protect, updateCommunity)
  .delete(protect, deleteCommunity);

router.route("/:id/join").post(protect, joinCommunity);

router.route("/:id/leave").delete(protect, leaveCommunity);

router.route("/:id/members").get(protect, getCommunityMembers);

export default router;

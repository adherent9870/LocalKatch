import mongoose from "mongoose";

const communityMemberSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "admin", "moderator", "member"],
      default: "member",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate membership
communityMemberSchema.index(
  {
    community: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

const CommunityMember = mongoose.model(
  "CommunityMember",
  communityMemberSchema
);

export default CommunityMember;

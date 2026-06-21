import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    category: {
      type: String,
      trim: true,
      default: "General",
    },

    avatar: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    membersCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    postsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rules: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Search optimization
communitySchema.index({ name: 1 });
communitySchema.index({ category: 1 });

const Community = mongoose.model("Community", communitySchema);

export default Community;

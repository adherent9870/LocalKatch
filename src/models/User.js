import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    avatar: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },

    coverImage: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    roles: [
      {
        type: String,
        enum: ["user", "mentor", "coach", "organization"],
        default: "user",
      },
    ],

    interests: [
      {
        type: String,
      },
    ],

    skills: [
      {
        type: String,
      },
    ],

    goals: [
      {
        type: String,
      },
    ],

    college: {
      type: String,
      default: "",
    },

    profession: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    locationVisibility: {
      type: String,
      enum: ["exact", "approximate", "hidden"],
      default: "approximate",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // posts: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Post",
    //   },
    // ],

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Geospatial Index
userSchema.index({ location: "2dsphere" });
// because without that mongodb could not able to perform location based queries

const User = mongoose.model("User", userSchema);

export default User;

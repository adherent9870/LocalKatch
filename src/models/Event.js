import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    banner: {
      type: String,
      default: "",
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },

    category: {
      type: String,
      default: "General",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (value) {
            return value.length === 2;
          },
          message: "Coordinates must contain [lng, lat]",
        },
      },
    },

    address: {
      type: String,
      required: true,
    },

    maxAttendees: {
      type: Number,
      min: 1,
      default: null,
    },

    attendeesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);
eventSchema.index({ organizer: 1 });
eventSchema.index({ community: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ location: "2dsphere" });

const Event = mongoose.model("Event", eventSchema);

export default Event;

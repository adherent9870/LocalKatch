import mongoose from "mongoose";

const eventAttendeeSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["registered", "attended", "cancelled"],
      default: "registered",
    },
  },
  {
    timestamps: true,
  }
);

eventAttendeeSchema.index(
  {
    event: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

const EventAttendee = mongoose.model("EventAttendee", eventAttendeeSchema);

export default EventAttendee;

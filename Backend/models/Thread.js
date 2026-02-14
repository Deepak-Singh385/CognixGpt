import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const ThreadSchema = new mongoose.Schema(
  {
    // 🔥 NEW FIELD (IMPORTANT)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      default: "New Chat",
    },

    messages: [MessageSchema],
  },
  { timestamps: true }, // replaces createdAt & updatedAt
);

export default mongoose.model("Thread", ThreadSchema);

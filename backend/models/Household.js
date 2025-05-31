import mongoose from "mongoose";

const householdSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        required: true,
        enum: ["owner", "admin", "member"],
        default: "member",
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Household", householdSchema);
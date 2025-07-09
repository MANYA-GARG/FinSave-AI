import mongoose from "mongoose";

const savingGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  year: { type: Number, required: true },
  month: { type: Number }, // Optional (1-12) — null for yearly goal
  goalAmount: { type: Number, required: true },
}, { timestamps: true });

savingGoalSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model("SavingGoal", savingGoalSchema);

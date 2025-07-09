import mongoose from "mongoose";

const badgeDefinitionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  iconUrl: { type: String, default: "" },
  streakLength: { type: Number, required: true }, // e.g., 3, 7, 30
}, { timestamps: true });

const BadgeDefinition = mongoose.model("BadgeDefinition", badgeDefinitionSchema);
export default BadgeDefinition;

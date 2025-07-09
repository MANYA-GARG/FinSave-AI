import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  badgeDefinitionId: { type: mongoose.Schema.Types.ObjectId, ref: "BadgeDefinition", required: true },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });

badgeSchema.index({ user: 1, badgeDefinitionId: 1 }, { unique: true });

const Badge = mongoose.model("Badge", badgeSchema);
export default Badge;

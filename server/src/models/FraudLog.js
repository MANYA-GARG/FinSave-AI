import mongoose from "mongoose";

const fraudLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  reason: { type: String, required: true, trim: true },

  triggeredAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
  notes: { type: String, trim: true }
}, { timestamps: true });

fraudLogSchema.index({ user: 1, triggeredAt: -1 });
fraudLogSchema.index({ transaction: 1 }, { unique: true });

const FraudLog = mongoose.model("FraudLog", fraudLogSchema);
export default FraudLog;

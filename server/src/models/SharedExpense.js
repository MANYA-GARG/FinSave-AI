import mongoose from "mongoose";

const sharedExpenseSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0.01,
  },

  description: {
    type: String,
    trim: true,
    default: "",
  },

  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      shareAmount: { type: Number, required: true, min: 0 },
      status: {
        type: String,
        enum: ["pending", "settled", "rejected"],
        default: "pending",
      },
    },
  ],

  splitType: {
    type: String,
    enum: ["equal", "unequal", "percentage"],
    default: "equal",
  },

  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  overallStatus: {
    type: String,
    enum: ["open", "partially_settled", "fully_settled", "cancelled"],
    default: "open",
  },

  settlementTransactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  ],

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

sharedExpenseSchema.index({ initiator: 1, createdAt: -1 });
sharedExpenseSchema.index({ "participants.user": 1 });

const SharedExpense = mongoose.model("SharedExpense", sharedExpenseSchema);
export default SharedExpense;

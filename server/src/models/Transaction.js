import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  // The user who owns this transaction record
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Transfer parties (can be null for income/expenses)
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  amount: { type: Number, required: true, min: 0.01 },

  description: { type: String, trim: true, default: "" },

  category: {
  type: String,  // ✅ Accept raw text like "Food", "Groceries"
  required: true
},

  transactionType: {
    type: String,
    enum: [
      "income",
      "expense",
      "deposit",
      "withdrawal",
      "manual",
      "transfer_debit",
      "transfer_credit",
      "split_payment_settlement",
    ],
    required: true,
  },

  merchant: { type: String, trim: true },        // Optional: Amazon, Zomato, etc.
  paymentMethod: { type: String, trim: true },   // Optional: UPI, Card, etc.

  // Fraud detection
  fraudFlag: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "success", "flagged", "rejected", "cancelled", "approved_by_user"],
    default: "pending",
  },

  // Link to related transaction (e.g., sender/debit ↔ receiver/credit)
  relatedTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    default: null,
  },

  // Link to SharedExpense (split)
  sharedExpenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SharedExpense",
    default: null,
  },

  // For approval threshold logic
  pendingApprovalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PendingApproval",
    default: null,
  },

  // AI helper fields
  aiCategorized: { type: Boolean, default: false },
  originalDescription: { type: String, trim: true },

  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

// Common indexes
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ status: 1, fraudFlag: 1 });
transactionSchema.index({ sender: 1, receiver: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;

import Transaction from "../models/Transaction.js";
import FraudLog from "../models/FraudLog.js";
import User from "../models/user.js";

// ✅ Approve a flagged transaction
export const approveFlaggedTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const txn = await Transaction.findById(transactionId);
    if (!txn || !txn.fraudFlag || txn.status !== "flagged") {
      return res.status(400).json({ message: "Invalid or non-flagged transaction" });
    }

    const sender = await User.findById(txn.sender);
    const receiver = await User.findById(txn.receiver);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User(s) not found" });
    }

    if (sender.balance < txn.amount) {
      return res.status(400).json({ message: "Insufficient balance to proceed" });
    }

    // Proceed with transfer
    sender.balance -= txn.amount;
    receiver.balance += txn.amount;

    await sender.save();
    await receiver.save();

    txn.status = "approved_by_user";
    txn.fraudFlag = false;
    await txn.save();

    await FraudLog.findOneAndUpdate(
      { transaction: txn._id },
      {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
      }
    );

    res.status(200).json({ message: "Transaction approved and completed." });
  } catch (error) {
    res.status(500).json({ message: "Error approving transaction", error });
  }
};

// ✅ Reject a flagged transaction and refund sender
export const rejectFlaggedTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const txn = await Transaction.findById(transactionId);
    if (!txn || !txn.fraudFlag || txn.status !== "flagged") {
      return res.status(400).json({ message: "Invalid or non-flagged transaction" });
    }

    const sender = await User.findById(txn.sender);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    txn.status = "rejected";
    txn.fraudFlag = false;
    await txn.save();

    await FraudLog.findOneAndUpdate(
      { transaction: txn._id },
      {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
        notes: "Rejected by user",
      }
    );

    // No need to deduct again (money was never moved)
    res.status(200).json({ message: "Transaction rejected and cancelled." });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting transaction", error });
  }
};

// ✅ View all fraud logs for current user
export const getMyFraudLogs = async (req, res) => {
  try {
    const logs = await FraudLog.find({ user: req.user._id })
      .sort({ triggeredAt: -1 })
      .populate("transaction");

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error });
  }
};

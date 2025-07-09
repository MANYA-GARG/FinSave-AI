import SharedExpense from "../models/SharedExpense.js";
import User from "../models/user.js";
import Transaction from "../models/Transaction.js";
import { sendSplitNotification } from "../services/mailService.js";
import Notification from "../models/Notification.js";

// ✅ Initiate a shared expense (Even or Custom Split)
export const initiateSharedExpense = async (req, res) => {
  try {
    const {
      totalAmount,
      description,
      participantUsernames,
      splitType,
      customSplits
    } = req.body;

    const initiator = req.user;

    if (!participantUsernames || participantUsernames.length === 0) {
      return res.status(400).json({ message: "At least one participant is required" });
    }

    // ✅ Normalize splitType for DB schema compatibility
    let normalizedSplitType = splitType;
    if (splitType === "even") normalizedSplitType = "equal";
    if (splitType === "custom") normalizedSplitType = "unequal";

    const participants = [];

    for (const username of participantUsernames) {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: `User not found: ${username}` });

      const shareAmount = normalizedSplitType === "equal"
        ? totalAmount / (participantUsernames.length + 1)
        : customSplits?.[username];

      if (!shareAmount || shareAmount <= 0) {
        return res.status(400).json({ message: `Invalid split for user: ${username}` });
      }
const share = parseFloat(shareAmount);
      participants.push({
        user: user._id,
        shareAmount: parseFloat(shareAmount),
        status: "pending"
      });
      if (user.email) {
  sendSplitNotification(user.email, initiator.username, description, share);
}

    }

    const newExpense = await SharedExpense.create({
      initiator: initiator._id,
      totalAmount,
      description,
      participants,
      paidBy: initiator._id,
      splitType: normalizedSplitType
    });
// ✅ Create notifications for initiator and participants
const allInvolvedUsers = [initiator._id.toString(), ...participantUsernames.map(username => {
  const participant = participants.find(p => p.user.toString() !== initiator._id.toString());
  return participant?.user.toString();
})].filter(Boolean);

const notificationDocs = allInvolvedUsers.map((userId) => ({
  userId,
  type: "split",
  message:
    userId === initiator._id.toString()
      ? `You created a split: "${description}" of ₹${totalAmount}`
      : `You've been added to a split: "${description}" of ₹${totalAmount}`,
  date: new Date(),
}));

await Notification.insertMany(notificationDocs);

    res.status(201).json({
      message: "Shared expense created",
      sharedExpenseId: newExpense._id
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating shared expense", error });
  }
};

// ✅ Settle or Reject a shared expense
export const respondToSharedExpense = async (req, res) => {
  try {
    const { status } = req.body;
    const expenseId = req.params.expenseId;
    const userId = req.user._id;

    const expense = await SharedExpense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const participant = expense.participants.find((p) => p.user.equals(userId));
    if (!participant) return res.status(403).json({ message: "You are not a participant" });

    if (participant.status !== "pending") {
      return res.status(400).json({ message: "Already settled or rejected" });
    }

    participant.status = status;

    if (status === "settled") {
      const payer = await User.findById(userId);
      const payee = await User.findById(expense.paidBy);

      if (payer.balance < participant.shareAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      payer.balance -= participant.shareAmount;
      payee.balance += participant.shareAmount;
      await payer.save();
      await payee.save();

      const txn = await Transaction.create({
        userId: payer._id,
        sender: payer._id,
        receiver: payee._id,
        amount: participant.shareAmount,
        transactionType: "split_payment_settlement",
        sharedExpenseId: expense._id,
        status: "success",
        description: `Settled share for: ${expense.description}`
      });

      expense.settlementTransactions.push(txn._id);
    }

    // Update overall status
    const allStatuses = expense.participants.map((p) => p.status);
    if (allStatuses.every((s) => s === "settled")) {
      expense.overallStatus = "fully_settled";
    } else if (allStatuses.some((s) => s === "settled")) {
      expense.overallStatus = "partially_settled";
    }

    await expense.save();

    res.status(200).json({ message: `Expense ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error responding to shared expense", error });
  }
};

// ✅ Get all shared expenses for the logged-in user
export const getMySharedExpenses = async (req, res) => {
  try {
    const userId = req.user._id;

    const expenses = await SharedExpense.find({
      $or: [
        { initiator: userId },
        { "participants.user": userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("initiator", "username")
      .populate("participants.user", "username")
      .populate("settlementTransactions");

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shared expenses", error });
  }
};

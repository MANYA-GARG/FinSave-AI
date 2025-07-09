import User from "../models/user.js";
import Transaction from "../models/Transaction.js";
import FraudLog from "../models/FraudLog.js";
import { checkAndAwardStreakBadges } from "../services/badgeService.js";
import dayjs from "dayjs";
import Category from "../models/Category.js"
import { sendApprovalEmail } from "../services/mailService.js";


// ✅ Wallet Balance
export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: "Error fetching balance", error });
  }
};

// ✅ Deposit Funds (category required)
export const depositFunds = async (req, res) => {
  const { amount, description = "User deposit", category } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!amount || amount <= 0 || !category) {
      return res.status(400).json({ message: "Amount and category are required" });
    }

    user.balance += amount;
    await user.save();

    const txn = await Transaction.create({
      userId: user._id,
      sender: null,
      receiver: user._id,
      amount,
      description,
      transactionType: "deposit",
      category,
      status: "success",
    });

    const badgeResult = await checkAndAwardStreakBadges(user._id);

    const response = {
      message: "Deposit successful",
      transactionId: txn._id,
    };

    if (badgeResult?.newlyEarned?.length > 0) {
      response.badgeInfo = badgeResult;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Deposit failed", error });
  }
};



// ✅ Send Money (category required)
export const sendMoney = async (req, res) => {
  console.log("➡️ Incoming sendMoney request:", req.body);
  const { toUsername, amount, description, category } = req.body;
 if (!toUsername || !amount || !category) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "Required fields missing" });
    }

  try {
    const sender = await User.findById(req.user._id);
    const receiver = await User.findOne({
  $or: [{ username: toUsername }, { email: toUsername }]
});
    console.log("Sender:", sender?.username, "Receiver:", receiver?.username);
    if (!receiver) return res.status(404).json({ message: "Receiver not found" });
    if (sender._id.equals(receiver._id)) return res.status(400).json({ message: "Cannot send money to yourself" });
    if (sender.balance < amount) return res.status(400).json({ message: "Insufficient balance" });
    const catDoc= await Category.findById(category);
    if (!catDoc) {
      console.log("❌ Invalid category:", category);
      return res.status(400).json({ message: "Invalid category selected" });
    }

    if (!catDoc) return res.status(400).json({ message: "Category is required" });
 console.log("Category validated:", catDoc.name);
    // Update balances
    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    const senderTxn = await Transaction.create({
      userId: sender._id,
      sender: sender._id,
      receiver: receiver._id,
      amount,
      description,
      transactionType: "transfer_debit",
      status: "success",
      category: catDoc.name,
    });

    const receiverTxn = await Transaction.create({
      userId: receiver._id,
      sender: sender._id,
      receiver: receiver._id,
      amount,
      description,
      transactionType: "transfer_credit",
      relatedTransactionId: senderTxn._id,
      status: "success",
       category: catDoc.name,
    });

    senderTxn.relatedTransactionId = receiverTxn._id;
    await senderTxn.save();

    const threshold = sender.preferences?.thresholdAmountForApproval || 5000;
    if (amount > threshold) {
      senderTxn.fraudFlag = true;
      senderTxn.status = "flagged";
      await senderTxn.save();

      await FraudLog.create({
        user: sender._id,
        transaction: senderTxn._id,
        reason: `Amount ₹${amount} exceeded threshold ₹${threshold}`,
      });
console.log("⚠️ Sending email to:", sender.email);
       await sendApprovalEmail(sender.email, senderTxn._id, amount, receiver.username, description);

      return res.status(403).json({
        message: "Transaction flagged for fraud. Awaiting approval.",
        flagged: true,
        transactionId: senderTxn._id,
      });
    }

    await senderTxn.save();

    res.status(200).json({
      message: "Transaction successful",
      transactionId: senderTxn._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Transaction failed", error });
  }
};

// ✅ Manual Expense
export const addManualExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    if (!amount || amount <= 0 || !category) {
      return res.status(400).json({ message: "Amount and category are required" });
    }

    const txn = await Transaction.create({
      userId: req.user._id,
      amount,
      description: description || "Manual cash expense",
      transactionType: "manual",
      category,
      status: "success",
    });

    res.status(201).json({ message: "Manual expense recorded", transaction: txn });
  } catch (error) {
    res.status(500).json({ message: "Failed to record manual expense", error });
  }
};

// ✅ Get Transactions
export const getTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("receiver", "username")
      .populate("sender", "username")
     

    res.status(200).json(txns);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error });
  }
};

// ✅ Monthly Summary
export const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(start).endOf("month").toDate();

    const txns = await Transaction.find({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end },
      status: "success",
    });

    let totalDeposits = 0, totalExpenses = 0;

    for (const txn of txns) {
      if (["deposit", "income"].includes(txn.transactionType)) {
        totalDeposits += txn.amount;
      } else if (["expense", "manual", "transfer_debit"].includes(txn.transactionType)) {
        totalExpenses += txn.amount;
      }
    }

    return res.status(200).json({
      totalDeposits,
      totalExpenses,
      totalSavings: totalDeposits - totalExpenses,
    });

  } catch (error) {
    console.error("Failed to calculate monthly summary", error);
    res.status(500).json({ message: "Failed to calculate monthly summary", error });
  }
};


export const getManualFHS = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId });

    let income = 0, expenses = 0;
    for (const txn of transactions) {
      if (["deposit", "income"].includes(txn.transactionType)) income += txn.amount;
      if (["manual", "expense", "transfer_debit"].includes(txn.transactionType)) expenses += txn.amount;
    }

    const total = income + expenses;
    const ratio = total === 0 ? 0 : income / total;

    // Score logic (you can customize)
    const score = Math.round(50 + ratio * 50); // ranges from 50–100

    res.status(200).json({ fhs: score });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate FHS", error });
  }
};

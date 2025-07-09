import Transaction from "../models/Transaction.js";
import SharedExpense from "../models/SharedExpense.js";

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const fraudAlerts = await Transaction.find({
      userId,
      fraudFlag: true,
    }).sort({ timestamp: -1 });

    const splitRequests = await SharedExpense.find({
      $or: [{ initiator: userId }, { "participants.user": userId }],
    })
      .populate("initiator", "username")
      .sort({ createdAt: -1 });

    const notifications = [];

    fraudAlerts.forEach((t) => {
      notifications.push({
        type: "fraud",
        message: `⚠️ Transaction flagged for ₹${t.amount} - ${t.description}`,
        date: t.timestamp,
      });
    });

    splitRequests.forEach((s) => {
      const isOwner = s.initiator._id.equals(userId);
      if (!isOwner) {
        notifications.push({
          type: "split",
          message: `💸 You owe ₹${s.totalAmount} to @${s.initiator.username}`,
          date: s.createdAt,
        });
      } else {
        notifications.push({
          type: "split",
          message: `🧾 You created a split for ₹${s.totalAmount}: "${s.description}"`,
          date: s.createdAt,
        });
      }
    });

    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Notification fetch failed", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

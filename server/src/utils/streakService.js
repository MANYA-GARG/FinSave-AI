import Transaction from "../models/Transaction.js";
import dayjs from "dayjs";

export const calculateSavingStreak = async (userId) => {
  const today = dayjs().startOf("day");
  const thirtyDaysAgo = today.subtract(30, "days");

  // Get all deposits/income from last 30 days
  const transactions = await Transaction.find({
    userId,
    transactionType: { $in: ["income", "deposit"] },
    timestamp: { $gte: thirtyDaysAgo.toDate(), $lte: today.toDate() },
    status: "success",
  }).sort({ timestamp: 1 }); // Sort oldest → newest

  // Extract unique saving dates
  const savedDates = [
    ...new Set(
      transactions.map((txn) =>
        dayjs(txn.timestamp).startOf("day").format("YYYY-MM-DD")
      )
    ),
  ];

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < savedDates.length; i++) {
    const prev = dayjs(savedDates[i - 1]);
    const curr = dayjs(savedDates[i]);

    if (curr.diff(prev, "day") === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return savedDates.length === 0 ? 0 : maxStreak;
};

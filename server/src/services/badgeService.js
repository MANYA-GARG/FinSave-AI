import Badge from "../models/Badge.js";
import BadgeDefinition from "../models/BadgeDefinition.js";
import { calculateSavingStreak } from "../utils/streakService.js";

// ✅ Checks streak → awards badges → returns result
export const checkAndAwardStreakBadges = async (userId) => {
  // 1. Get current streak (e.g., 3 days)
  const streak = await calculateSavingStreak(userId);

  // 2. Get all streak badges (e.g., 3, 5, 7, 30)
  const allDefinitions = await BadgeDefinition.find();

  // 3. Get badges user already earned
  const earned = await Badge.find({ user: userId }).select("badgeDefinitionId");
  const earnedIds = earned.map((b) => b.badgeDefinitionId.toString());

  const newlyEarned = [];

  for (let def of allDefinitions) {
    if (streak >= def.streakLength && !earnedIds.includes(def._id.toString())) {
      // Award it 🎉
      await Badge.create({
        user: userId,
        badgeDefinitionId: def._id,
      });

      newlyEarned.push(def.name);
    }
  }

  return {
    message: newlyEarned.length
      ? "New badge(s) awarded!"
      : "No new badges earned.",
    streak,
    newlyEarned,
  };
};

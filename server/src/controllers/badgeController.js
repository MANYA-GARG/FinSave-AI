import { calculateSavingStreak } from "../utils/streakService.js";
import Badge from "../models/Badge.js";
import BadgeDefinition from "../models/BadgeDefinition.js";

// ✅ POST /api/badges/check-streak
export const checkAndAwardBadge = async (req, res) => {
  try {
    const userId = req.user._id;
    const streak = await calculateSavingStreak(userId);

    const eligibleBadges = await BadgeDefinition.find({
      streakLength: { $lte: streak },
    });

    const alreadyEarned = await Badge.find({ user: userId });
    const earnedIds = alreadyEarned.map((b) =>
      b.badgeDefinitionId.toString()
    );

    const newlyEarned = [];

    for (const badgeDef of eligibleBadges) {
      if (!earnedIds.includes(badgeDef._id.toString())) {
        await Badge.create({
          user: userId,
          badgeDefinitionId: badgeDef._id,
        });
        newlyEarned.push(badgeDef.name);
      }
    }

    res.status(200).json({
      message:
        newlyEarned.length > 0
          ? "New badge(s) awarded!"
          : "No new badges earned.",
      streak,
      newlyEarned,
    });
  } catch (error) {
    res.status(500).json({ message: "Badge check failed", error });
  }
};

// ✅ GET /api/badges/my
export const getMyBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user._id })
      .sort({ earnedAt: -1 })
      .populate("badgeDefinitionId");

    const response = badges
      .filter((b) => b.badgeDefinitionId)
      .map((b) => ({
        name: b.badgeDefinitionId.name,
        description: b.badgeDefinitionId.description,
        iconUrl: b.badgeDefinitionId.iconUrl || "",
        earnedAt: b.earnedAt,
      }));

    res.status(200).json({ badges: response });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch badges", error });
  }
};

// ✅ GET /api/badges/all
export const getAllBadges = async (req, res) => {
  try {
    const badges = await BadgeDefinition.find().sort({ streakLength: 1 });
    res.status(200).json({ badges });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch badge definitions", error });
  }
};

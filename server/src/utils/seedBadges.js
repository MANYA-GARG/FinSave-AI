import mongoose from "mongoose";
import dotenv from "dotenv";
import BadgeDefinition from "../models/BadgeDefinition.js";

dotenv.config();

const seedBadges = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("✅ Database connected.");

    const existing = await BadgeDefinition.countDocuments();
    if (existing > 0) {
      console.log("🚫 Badges already seeded. Skipping.");
      process.exit(0);
    }

    const badges = [
      {
        name: "3-Day Saver",
        description: "Saved money 3 days in a row",
        streakLength: 3,
        iconUrl: ""
      },
      {
        name: "7-Day Champion",
        description: "Saved money 7 days in a row",
        streakLength: 7,
        iconUrl: ""
      },
      {
        name: "30-Day Legend",
        description: "Saved money 30 days in a row",
        streakLength: 30,
        iconUrl: ""
      }
    ];

    await BadgeDefinition.insertMany(badges);
    console.log("✅ Badge definitions inserted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed badges:", error);
    process.exit(1);
  }
};

seedBadges();

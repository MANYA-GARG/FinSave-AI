import express from "express";
import {
  checkAndAwardBadge,
  getMyBadges,
  getAllBadges, // ✅ added
} from "../controllers/badgeController.js";
import { isAuthenticated } from "../middleware/ensureAuthenticated.js";

const router = express.Router();

router.post("/check-streak", isAuthenticated, checkAndAwardBadge);
router.get("/my", isAuthenticated, getMyBadges);
router.get("/all", getAllBadges); // ✅ added

export default router;

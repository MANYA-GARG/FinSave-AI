import express from "express";
import { getUserNotifications } from "../controllers/notificationController.js";
import { isAuthenticated } from "../middleware/ensureAuthenticated.js";

const router = express.Router();

router.get("/my", isAuthenticated, getUserNotifications);

export default router;

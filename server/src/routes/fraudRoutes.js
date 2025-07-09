import express from "express";
import {
  approveFlaggedTransaction,
  rejectFlaggedTransaction,
  getMyFraudLogs,
} from "../controllers/fraudController.js";

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

router.post("/approve/:transactionId", isAuthenticated, approveFlaggedTransaction);
router.post("/reject/:transactionId", isAuthenticated, rejectFlaggedTransaction);
router.get("/logs", isAuthenticated, getMyFraudLogs);

export default router;

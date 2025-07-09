import express from "express";
import {
  initiateSharedExpense,
  respondToSharedExpense,
  getMySharedExpenses
} from "../controllers/sharedExpenseController.js";

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

router.post("/initiate", isAuthenticated, initiateSharedExpense);
router.post("/respond/:expenseId", isAuthenticated, respondToSharedExpense);
router.get("/my", isAuthenticated, getMySharedExpenses);

export default router;

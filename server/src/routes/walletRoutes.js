import express from "express";
import {
  getBalance,
  sendMoney,
  getTransactions,
  depositFunds,
   getManualFHS 
} from "../controllers/walletController.js";
import { getMonthlySummary } from "../controllers/walletController.js"
import { addManualExpense } from "../controllers/walletController.js";

const router = express.Router();

// Protect with session (or JWT if added)
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

router.get("/balance", isAuthenticated, getBalance);
router.post("/send", isAuthenticated, sendMoney);
router.get("/transactions", isAuthenticated, getTransactions);
router.post("/deposit", isAuthenticated, depositFunds); // ✅ Add this line
router.get("/summary", isAuthenticated, getMonthlySummary);

router.post("/manual-expense", isAuthenticated, addManualExpense);
router.get("/fhs-manual", isAuthenticated, getManualFHS);



export default router;

// src/routes/aiRoutes.js
import express from "express";
import { getFHS, getBudgetAdvice ,  handleGeneralAiQuery  } from "../controllers/aiController.js";
import { isAuthenticated } from "../middleware/ensureAuthenticated.js";

const router = express.Router();

router.get("/fhs", isAuthenticated, getFHS);
router.get("/advice", isAuthenticated, getBudgetAdvice);
router.get("/ask", isAuthenticated, handleGeneralAiQuery);

export default router;

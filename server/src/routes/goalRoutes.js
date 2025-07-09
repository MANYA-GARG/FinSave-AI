import express from "express";
import { isAuthenticated } from "../middleware/ensureAuthenticated.js";
import { setGoal, getGoals } from "../controllers/goalController.js";

const router = express.Router();

router.post("/set", isAuthenticated, setGoal);
router.get("/my", isAuthenticated, getGoals);

export default router;

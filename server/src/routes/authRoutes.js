import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  authStatus,
  logout,
  setup2FA,
  verify2FA,
  reset2FA,
} from "../controllers/authController.js";
import User from "../models/user.js";

const router = Router();

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

// 🟡 Register route
router.post("/register", register);

// 🟡 Login with Passport local strategy
router.post("/login", passport.authenticate("local"), login);

// 🟡 Check if logged in
router.get("/status", authStatus);

// 🟡 Logout
router.post("/logout", logout);

// 🟡 2FA Setup
router.post("/2fa/setup", isAuthenticated, setup2FA);

// 🟡 2FA Verify
router.post("/2fa/verify", isAuthenticated, verify2FA);

// 🟡 2FA Reset
router.post("/2fa/reset", isAuthenticated, reset2FA);

// ✅ New: User search route for Split Expense (autocomplete)
router.get("/search-users", isAuthenticated, async (req, res) => {
  try {
    const query = req.query.q || "";
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    })
      .limit(10)
      .select("username");

    const usernames = users.map((u) => u.username);
    res.status(200).json({ users: usernames });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

export default router;

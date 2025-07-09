import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

export default router;

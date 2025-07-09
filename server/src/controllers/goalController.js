import SavingGoal from "../models/SavingGoal.js";

export const setGoal = async (req, res) => {
  const { year, month, goalAmount } = req.body;
  try {
    const goal = await SavingGoal.findOneAndUpdate(
      { user: req.user._id, year, month: month || null },
      { goalAmount },
      { upsert: true, new: true }
    );
    res.status(200).json({ goal });
  } catch (err) {
    res.status(500).json({ message: "Failed to set goal", err });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await SavingGoal.find({ user: req.user._id });
    res.status(200).json({ goals });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch goals", err });
  }
};

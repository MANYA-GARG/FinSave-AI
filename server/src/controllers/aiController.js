// src/controllers/aiController.js
import { askGemini } from "../utils/aiHelper.js";
import Transaction from "../models/Transaction.js";

// ✅ GET Financial Health Score
export const getFHS = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);

    const summary = transactions
      .map((t) => {
        const date = t.timestamp?.toISOString()?.split('T')[0] || "unknown date";
        const label = t.description || t.transactionType || "unknown";
        return `${date}: ₹${t.amount} - ${label}`;
      })
      .join("\n");

    const prompt = `
You are a smart financial advisor. Based on the following transactions, estimate the user's Financial Health Score (FHS) out of 100.

Explain your reasoning briefly. Consider:
- spending habits
- savings regularity
- transaction types
- any red flags like frequent high expenses or fraud

Transactions:
${summary}
    `;

    const response = await askGemini(prompt.trim());
    res.status(200).json({ result: response });
  } catch (error) {
    res.status(500).json({ message: "Failed to get FHS", error });
  }
};

// ✅ GET Budgeting Advice
export const getBudgetAdvice = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);

    const summary = transactions
      .map((t) => {
        const date = t.timestamp?.toISOString()?.split('T')[0] || "unknown date";
        const label = t.description || t.transactionType || "unknown";
        return `${date}: ₹${t.amount} - ${label}`;
      })
      .join("\n");

    const prompt = `
Act like a personal finance coach. Based on the user's recent financial activity below, suggest 3 clear, actionable budgeting tips.

Make suggestions around:
- how to increase savings
- reduce wasteful spending
- improve financial discipline

Transactions:
${summary}
    `;

    const response = await askGemini(prompt.trim());
    res.status(200).json({ result: response });
  } catch (error) {
    res.status(500).json({ message: "Failed to get budgeting advice", error });
  }
};

export const handleGeneralAiQuery = async (req, res) => {
  try {
    const userId = req.user._id;
    const query = req.query.query; // e.g., ?query=How much am I saving?

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Get the latest 25 transactions from DB
    const transactions = await Transaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(25);

    // Format each transaction into a short readable line
    const summary = transactions
      .map((t) => {
        const date = t.timestamp?.toISOString().split("T")[0] || "unknown";
        const label = t.description || t.transactionType || "unknown";
        return `${date}: ₹${t.amount} - ${label}`;
      })
      .join("\n");

    // Construct the prompt for Gemini
    const prompt = `
You are an intelligent financial assistant.

The user asked: "${query}"

Based on the following recent transactions, respond helpfully:

${summary}

Respond in a concise, friendly tone and provide clear financial insight.
`;

    // Call Gemini AI with the prompt
    const reply = await askGemini(prompt.trim());

    // Send result to frontend
    res.status(200).json({ result: reply });
  } catch (error) {
    res.status(500).json({ message: "AI assistant failed", error });
  }
};

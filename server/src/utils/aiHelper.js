// src/utils/aiHelper.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import Category from "../models/Category.js";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const API_KEY = process.env.GEMINI_API_KEY;

// 🔹 General AI Function (for FHS, budgeting, etc.)
export const askGemini = async (promptText) => {
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok || !data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Gemini API response error:", data);
      return "⚠️ Gemini did not return a valid response.";
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "❌ Error contacting Gemini API.";
  }
};

// 🔹 Auto-categorize a transaction using Gemini
export const categorizeTransactionWithGemini = async (description, amount) => {
  try {
    const prompt = `
You are a smart finance assistant. Categorize this transaction into one of the following:
Food, Travel, Utilities, Shopping, Entertainment, Rent, Health, Education, Investment, Miscellaneous.

Transaction:
Description: "${description}"
Amount: ₹${amount}

Respond ONLY with one category word. No explanation.
`;

    const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!raw) {
      console.warn("Gemini returned empty category");
      return null;
    }

    const cleanCategory = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

    let category = await Category.findOne({ name: cleanCategory });
    if (!category) {
      category = await Category.create({ name: cleanCategory });
    }

    return category._id;
  } catch (error) {
    console.error("Error in categorizeTransactionWithGemini:", error);
    return null;
  }
};

// src/services/mailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendApprovalEmail = async (to, txnId, amount, receiverName, description) => {
  console.log("📨 sendApprovalEmail called");
  console.log("Recipient:", to);
  console.log("MAIL_USER:", process.env.MAIL_USER ? "Loaded" : "Missing");
  console.log("MAIL_PASS:", process.env.MAIL_PASS ? "Loaded" : "Missin
  const approveUrl = `http://localhost:5173/approve/${txnId}`;
  const rejectUrl = `http://localhost:5173/reject/${txnId}`;

  const html = `
    <h2>🚨 Transaction Flagged</h2>
    <p>A transaction of <strong>₹${amount}</strong> to <strong>${receiverName}</strong> was flagged for manual approval.</p>
    <p><strong>Description:</strong> ${description}</p>
    <p>Please take action:</p>
    <a href="${approveUrl}" style="padding: 10px 20px; background: green; color: white; text-decoration: none; margin-right: 10px;">Approve</a>
    <a href="${rejectUrl}" style="padding: 10px 20px; background: red; color: white; text-decoration: none;">Reject</a>
  `;

   try {
       console.log("📡 Attempting to send email...");
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: "⚠️ FinSave: Action Required for Flagged Transaction",
      html,
    });

    console.log("✅ Email sent successfully!");
    console.log("📩 Message ID:", info.messageId);
    console.log("🧾 Preview URL (if ethereal):", nodemailer.getTestMessageUrl?.(info));
  } catch (err) {
      console.error("❌ Failed to send email:", err);
    console.error("❌ Failed to send email:", err.message);
  }
};

export const sendSplitNotification = async (to, initiatorName, description, amount) => {
  const html = `
    <h2>📢 You've been added to a shared expense!</h2>
    <p><strong>${initiatorName}</strong> has added you to a shared expense on <strong>FinSave</strong>.</p>
    <p><strong>Description:</strong> ${description}</p>
    <p><strong>Your Share:</strong> ₹${amount}</p>
    <p>📥 Please log in to FinSave to settle or reject this expense.</p>
    <a href="http://localhost:5173/dashboard" style="display: inline-block; padding: 10px 16px; background-color: #4f46e5; color: white; border-radius: 6px; text-decoration: none;">View Now</a>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: `📬 New Split Expense on FinSave`,
      html,
    });

    console.log("📤 Split expense email sent to:", to);
    console.log("📩 Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send split expense email:", err.message);
  }
};

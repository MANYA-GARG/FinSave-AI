import bcrypt from "bcryptjs";
import User from "../models/user.js";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import jwt from "jsonwebtoken";

// ✅ Register a user
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isMfaActive: false,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Registration failed", error });
    }
  }
};

// ✅ Login (using Passport)
export const login = async (req, res) => {
  console.log("Authenticated user:", req.user);
  return res.status(200).json({
    message: "User logged in successfully",
    username: req.user.username,
    isMfaActive: req.user.isMfaActive,
  });
};

// ✅ Check session-based auth status
export const authStatus = async (req, res) => {
  if (req.user) {
    return res.status(200).json({
      message: "User is authenticated",
      username: req.user.username,
      isMfaActive: req.user.isMfaActive,
    });
  } else {
    return res.status(401).json({ message: "Unauthorized user" });
  }
};

// ✅ Logout
export const logout = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized user" });
  }

  req.logout((err) => {
    if (err) {
      return res.status(400).json({ message: "Logout failed", error: err });
    }
    return res.status(200).json({ message: "Logout successful" });
  });
};

// ✅ Setup 2FA
export const setup2FA = async (req, res) => {
  try {
    const user = req.user;
    const secret = speakeasy.generateSecret();

    user.twoFactorSecret = secret.base32;
    user.isMfaActive = true;
    await user.save();

    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `${user.username}`,
      issuer: "FinSave",
      encoding: "base32",
    });

    const qrCodeDataURL = await qrCode.toDataURL(otpAuthUrl);

    return res.status(200).json({
      secret: secret.base32,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return res.status(500).json({ message: "Error setting up 2FA", error });
  }
};

// ✅ Verify 2FA OTP
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA token" });
    }

    const jwtToken = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "2FA successful",
      token: jwtToken,
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return res.status(500).json({ message: "2FA verification failed", error });
  }
};

// ✅ Reset 2FA
export const reset2FA = async (req, res) => {
  try {
    const user = req.user;

    user.twoFactorSecret = "";
    user.isMfaActive = false;

    await user.save();

    return res.status(200).json({ message: "2FA reset successful" });
  } catch (error) {
    console.error("2FA reset error:", error);
    return res.status(500).json({ message: "Error resetting 2FA", error });
  }
};

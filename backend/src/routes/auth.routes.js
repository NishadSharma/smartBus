const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// In-memory OTP store (mobile -> { otp, expires })
const otps = new Map();

// POST /api/auth/send-otp
router.post("/auth/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body || {};
    if (!mobile) return res.status(400).json({ ok: false, error: "Mobile number is required" });

    // Hardcoded demo OTP as requested
    const demoOtp = "123456";
    
    otps.set(mobile, {
      otp: demoOtp,
      expires: Date.now() + 5 * 60 * 1000 // 5 mins expiry
    });

    console.log(`[Demo] OTP for ${mobile} is ${demoOtp}`);

    return res.json({ ok: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/auth/verify-otp
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body || {};
    if (!mobile || !otp) return res.status(400).json({ ok: false, error: "Mobile and OTP required" });

    const record = otps.get(mobile);
    if (!record) return res.status(400).json({ ok: false, error: "No OTP found or expired" });
    if (Date.now() > record.expires) {
      otps.delete(mobile);
      return res.status(400).json({ ok: false, error: "OTP expired" });
    }
    if (record.otp !== String(otp)) {
      return res.status(400).json({ ok: false, error: "Invalid OTP" });
    }

    // OTP verified, remove it
    otps.delete(mobile);

    let user = await User.findOne({ mobile });

    if (!user) {
      // Auto-create user
      const randomSuffix = Math.random().toString(36).substring(2, 6).toLowerCase();
      const generatedUsername = `user_${mobile.substring(0, 4)}_${randomSuffix}`;
      
      const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
      
      user = await User.create({
        username: generatedUsername,
        mobile: mobile,
        passwordHash,
        role: "commuter"
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, busId: user.busId || "" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      ok: true,
      user: { id: user._id, username: user.username, role: user.role, busId: user.busId || "" },
    });

  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, mobile, state, district, password, role } = req.body || {};

    if (!password) {
      return res.status(400).json({ ok: false, error: "password required" });
    }

    // Auto-generate username
    const randomSuffix = Math.random().toString(36).substring(2, 6).toLowerCase();
    const prefix = name ? name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : "user";
    const generatedUsername = `${prefix}_${randomSuffix}`;

    const existing = await User.findOne({ username: generatedUsername }).lean();
    // In rare cases of collision, regenerate
    let finalUsername = generatedUsername;
    if (existing) {
      finalUsername = `${finalUsername}${Math.floor(Math.random() * 100)}`;
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      username: finalUsername,
      name: name ? String(name).trim() : undefined,
      email: email ? String(email).trim() : undefined,
      mobile: mobile ? String(mobile).trim() : undefined,
      state: state ? String(state).trim() : undefined,
      district: district ? String(district).trim() : undefined,
      passwordHash,
      role: role || "commuter"
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, busId: user.busId || "" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      ok: true,
      user: { id: user._id, username: user.username, role: user.role, busId: user.busId || "" },
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err?.code === 11000) return res.status(409).json({ ok: false, error: "Username already registered" });
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    // accept 'identity' from frontend, which could be email, mobile, or username
    const { identity, password } = req.body || {};

    if (!identity || !password) {
      return res.status(400).json({ ok: false, error: "identity and password required" });
    }

    const identityNorm = String(identity).toLowerCase().trim();

    // Query either email, mobile or username
    const user = await User.findOne({ 
      $or: [
        { email: identityNorm },
        { mobile: identityNorm },
        { username: identityNorm }
      ]
    });
    if (!user) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, busId: user.busId || "" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      ok: true,
      user: { id: user._id, username: user.username, role: user.role, busId: user.busId || "" },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  return res.json({ ok: true, user: req.user });
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  return res.json({ ok: true });
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "email and password required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  return res.json({ ok: true, message: "Use protected route later (optional)" });
});

module.exports = router;

require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("../db");
const User = require("../models/User");

async function run() {
  await connectDB();

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("✅ Admin already exists:", existingAdmin.email);
    process.exit(0);
  }

  const email = process.env.SEED_ADMIN_EMAIL || "admin@smartbus.local";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const name = "System Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
  });

  console.log("✅ Admin created:");
  console.log("Email:", admin.email);
  console.log("Password:", password);
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});

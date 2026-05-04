const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");
require("dotenv").config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB...");

  // Clear existing users 
  // (We'll nuke old test users without a role or name if we want, but letting them be is fine)
  await User.deleteMany({});
  
  const hAdmin = await bcrypt.hash("pass", 10);
  const hOper = await bcrypt.hash("pass", 10);
  const hComm = await bcrypt.hash("pass", 10);

  const users = [
    { username: "admin", role: "admin", email: "admin@example.com", passwordHash: hAdmin, busId: "" },
    { username: "bus101", role: "operator", email: "bus101@example.com", passwordHash: hOper, busId: "BUS-101" },
    { username: "passenger", role: "commuter", email: "passenger@example.com", passwordHash: hComm, busId: "" }
  ];

  await User.insertMany(users);
  console.log("Seeded default users:", users.map(u => ({ username: u.username, role: u.role })));
  
  mongoose.disconnect();
}

seed().catch(console.error);

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "driver", "user"],
      default: "user",
      index: true,
    },

    // for drivers only (optional)
    assignedBusId: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", UserSchema);

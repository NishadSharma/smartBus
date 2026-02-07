const express = require("express");
const router = express.Router();
const { updateGps } = require("../controllers/gps.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

// 🔒 Driver can update GPS (Admin optional)
router.post("/gps/update", requireAuth, requireRole("driver", "admin"), updateGps);

module.exports = router;

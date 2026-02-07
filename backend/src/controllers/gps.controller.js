const BusLatest = require("../models/BusLatest");
const User = require("../models/User");

function isNumber(x) {
  return typeof x === "number" && Number.isFinite(x);
}

exports.updateGps = async (req, res) => {
  try {
    let { busId, lat, lng, speed, routeId } = req.body;

    if (typeof busId === "string") busId = busId.trim();
    if (typeof routeId === "string") routeId = routeId.trim();

    // Required fields
    if (!busId) return res.status(400).json({ ok: false, error: "busId is required" });
    if (!isNumber(lat) || !isNumber(lng)) {
      return res.status(400).json({ ok: false, error: "lat and lng must be numbers" });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ ok: false, error: "lat/lng out of range" });
    }

    // 🔒 Driver can update ONLY their assigned bus
    if (req.user.role === "driver") {
      const driver = await User.findById(req.user.id).lean();
      if (!driver) return res.status(401).json({ ok: false, error: "Driver not found" });

      if (!driver.assignedBusId) {
        return res.status(403).json({ ok: false, error: "Driver has no assigned bus" });
      }

      if (String(driver.assignedBusId) !== String(busId)) {
        return res.status(403).json({
          ok: false,
          error: "Forbidden: driver can update only assigned bus",
        });
      }
    }

    // Optional speed
    if (speed == null) speed = 0;
    if (!isNumber(speed)) speed = 0;
    if (speed < 0) speed = 0;

    // Optional routeId
    if (typeof routeId !== "string") routeId = "";

    const updated = await BusLatest.findOneAndUpdate(
      { busId },
      { busId, lat, lng, speed, routeId, timestamp: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, message: "GPS updated", data: updated });
  } catch (err) {
    console.error("GPS update error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

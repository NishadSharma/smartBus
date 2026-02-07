const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  // DEBUG: print what server actually receives
  console.log("AUTH HEADER:", req.headers.authorization);

  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, error: "Missing Bearer token" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid/expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ ok: false, error: "Unauthenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ ok: false, error: "Forbidden" });
    next();
  };
}

module.exports = { requireAuth, requireRole };

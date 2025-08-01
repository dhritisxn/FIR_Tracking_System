const jwt = require("jsonwebtoken");

function auth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      req.user = decoded;
      if (requiredRole && decoded.role !== requiredRole && decoded.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: insufficient rights" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

module.exports = auth;

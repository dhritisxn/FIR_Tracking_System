const jwt = require("jsonwebtoken");

// Role vocabulary, matching the User model's role enum
const ROLES = Object.freeze({ CITIZEN: "citizen", OFFICER: "officer", ADMIN: "admin" });
const STAFF_ROLES = [ROLES.OFFICER, ROLES.ADMIN];

const WEAK_SECRETS = ["secret", "your-secret-key", "changeme", "jwt_secret"];

// The single secret used to both sign and verify tokens. There is no fallback:
// a missing or guessable secret stops the server from starting.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || WEAK_SECRETS.includes(secret.trim().toLowerCase())) {
    throw new Error("JWT_SECRET must be set to a strong random value (e.g. 64 random hex characters)");
  }
  if (secret.length < 32) {
    console.warn("Warning: JWT_SECRET is shorter than 32 characters; use a longer random value");
  }
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: "1d" }
  );
}

// auth()                       any logged-in user
// auth("citizen")              that role only (admins are always allowed)
// auth(["officer", "admin"])   any of the listed roles
function auth(allowedRoles) {
  const roles = allowedRoles ? [].concat(allowedRoles) : null;
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = decoded;
      if (roles && !roles.includes(decoded.role) && decoded.role !== ROLES.ADMIN) {
        return res.status(403).json({ error: "Forbidden: insufficient rights" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

module.exports = auth;
module.exports.ROLES = ROLES;
module.exports.STAFF_ROLES = STAFF_ROLES;
module.exports.getJwtSecret = getJwtSecret;
module.exports.signToken = signToken;

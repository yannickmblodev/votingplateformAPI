const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ error: "Token manquant (admin)" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token invalide (admin)" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Accès réservé à l’administrateur" });
    }

    req.user = decoded; // On garde le user dans req pour les handlers
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token expiré ou invalide (admin)" });
  }
}

module.exports = requireAdmin;

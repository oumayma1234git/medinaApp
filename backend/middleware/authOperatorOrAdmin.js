// middleware/authOperatorOrAdmin.js
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");

const secret = config.JWT_SECRET;

const authOperatorOrAdmin = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user || (user.role !== "admin" && user.role !== "operateur")) {
      return res.status(403).json({ message: "Accès réservé aux opérateurs ou à l'admin." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide." });
  }
};

module.exports = authOperatorOrAdmin;
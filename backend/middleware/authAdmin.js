const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authAdmin = async (req, res, next) => {
  try {
    // 1. Récupération du token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      });
    }

    // 2. Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Recherche de l'utilisateur
    const user = await User.findOne({
      _id: decoded.id,
      role: 'admin'
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Droits administrateur requis"
      });
    }

    // 4. Ajout de l'utilisateur à la requête
    req.user = user;
    req.token = token;
    next();

  } catch (err) {
    console.error("Erreur d'authentification admin:", err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Session expirée"
      });
    }

    res.status(401).json({
      success: false,
      message: "Authentification invalide"
    });
  }
};

module.exports = authAdmin;
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

// Middleware de validation
const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
  }
  next();
};

// 1. Inscription Client
router.post("/signup", validateSignup, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const user = new User({ 
      username, 
      email, 
      password, 
      role: "client" 
    });

    await user.save();
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ 
      message: "Inscription réussie",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Erreur inscription:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 2. Connexion Générale
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Erreur connexion:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 3. Connexion Admin
router.post("/admin/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email et mot de passe requis" 
      });
    }

    const admin = await User.findOne({ 
      email: email.trim().toLowerCase(), 
      role: "admin" 
    }).select('+password');

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Identifiants invalides" 
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Identifiants invalides" 
      });
    }

    const token = jwt.sign(
      { 
        id: admin._id,
        role: admin.role,
        email: admin.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Connexion admin réussie",
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      tokenExpiration: Date.now() + 3600 * 1000
    });

  } catch (err) {
    console.error("Erreur connexion admin:", err);
    res.status(500).json({ 
      success: false,
      error: "Erreur serveur" 
    });
  }
});


// 4. Connexion Opérateur - Version corrigée
router.post("/operator/signin", async (req, res) => {
  try {
    const { cin, password } = req.body;

    if (!cin || !password) {
      return res.status(400).json({ message: "CIN et mot de passe requis" });
    }

    // Recherche de l'opérateur
    const operator = await User.findOne({ cin, role: "operateur" });
    if (!operator) {
      return res.status(401).json({ 
        message: "Identifiants invalides", 
        details: "Aucun opérateur trouvé avec ce CIN" 
      });
    }

    // Vérification directe du mot de passe
    const isMatch = await bcrypt.compare(password, operator.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Identifiants invalides", 
        details: "Mot de passe incorrect" 
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: operator._id,
        role: operator.role,
        cin: operator.cin
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Connexion opérateur réussie",
      token,
      user: {
        id: operator._id,
        username: operator.username,
        cin: operator.cin,
        role: operator.role
      }
    });

  } catch (err) {
    console.error("Erreur connexion opérateur:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});
module.exports = router;
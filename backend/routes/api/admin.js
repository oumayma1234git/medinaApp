const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const authAdmin = require('../../middleware/authAdmin'); 
const Film = require('../../models/Film');
const Seance = require('../../models/Seance');

const router = express.Router();

// Middleware pour le dashboard admin
router.get('/admin/dashboard', authAdmin, (req, res) => {
  res.json({
    success: true,
    data: "Contenu admin sécurisé"
  });
});

// Route pour ajouter un opérateur (corrigée pour éviter le double hachage)
router.post("/operator/add", authAdmin, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès interdit. Seul l'admin peut ajouter un opérateur." });
  }

  const { cin, username, password } = req.body;
  
  if (!cin || !username || !password) {
    return res.status(400).json({ message: "Tous les champs (CIN, username, password) sont requis." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
  }

  try {
    const existingOperator = await User.findOne({ cin, role: "operateur" });
    if (existingOperator) {
      return res.status(400).json({ message: "CIN déjà utilisé." });
    }

    const existingUsername = await User.findOne({ username, role: "operateur" });
    if (existingUsername) {
      return res.status(400).json({ message: "Nom d'utilisateur déjà utilisé." });
    }

    // Créer un nouvel opérateur avec le mot de passe en clair
    // Le middleware pre-save du modèle User va s'occuper du hachage
    const newOperator = new User({
      cin,
      username,
      email: `operateur.${cin}@cinema.com`,
      password: password, // Mot de passe en clair - sera haché par le modèle
      role: "operateur",
    });

    await newOperator.save();

    res.status(201).json({ 
      message: "Opérateur ajouté avec succès.",
      operator: {
        id: newOperator._id,
        cin: newOperator.cin,
        username: newOperator.username
      }
    });

  } catch (err) {
    console.error("Erreur lors de l'ajout d'opérateur:", err);
    res.status(500).json({ error: "Erreur serveur lors de l'ajout de l'opérateur." });
  }
});

// Afficher les opérateurs
router.get("/users/operators", authAdmin, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit. Seul l'admin peut accéder à cette ressource." });
    }

    const operators = await User.find({ role: "operateur" }).select("-password");
    res.status(200).json({ operators });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la récupération des opérateurs." });
  }
});

// Afficher les clients
router.get("/users/clients", authAdmin, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit. Seul l'admin peut accéder à cette ressource." });
    }

    const clients = await User.find({ role: "client" }).select("-password");
    res.status(200).json({ clients });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la récupération des clients." });
  }
});

// Voir tous les utilisateurs
router.get("/users", authAdmin, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit. Seul l'admin peut voir les utilisateurs." });
    }

    const users = await User.find({}, "-password");
    res.status(200).json({ users });
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modifier un utilisateur (corrigé pour éviter le double hachage)
router.put("/users/:id", authAdmin, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé. Admin uniquement." });
  }

  const { username, email, cin, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    if (username) user.username = username;
    if (email !== undefined) user.email = email;
    if (cin !== undefined) user.cin = cin;

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
      }
      // Assigner le mot de passe en clair - le modèle s'occupera du hachage
      user.password = password;
    }

    await user.save();

    res.status(200).json({ message: "Utilisateur modifié avec succès.", user });
  } catch (err) {
    console.error("Erreur lors de la modification :", err);
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un utilisateur
router.delete("/users/:id", authAdmin, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit. Seul l'admin peut supprimer un utilisateur." });
    }

    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modifier profil admin (corrigé pour éviter le double hachage)
router.put("/profile", authAdmin, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès interdit. Seul l'admin peut modifier son profil." });
    }

    const { username, email, password } = req.body;
    const admin = await User.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin non trouvé" });
    }

    if (username) admin.username = username;
    if (email) admin.email = email;
    
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
      }
      // Assigner le mot de passe en clair - le modèle s'occupera du hachage
      admin.password = password;
    }

    await admin.save();

    res.status(200).json({ message: "Profil mis à jour avec succès", admin });
  } catch (err) {
    console.error("Erreur mise à jour profil admin :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Statistiques
router.get('/stats', authAdmin, async (req, res) => {
  try {
    const clientsCount = await User.countDocuments({ role: 'client' });
    const operateursCount = await User.countDocuments({ role: 'operateur' });
    const filmsCount = await Film.countDocuments();
    const SeancesCount = await Seance.countDocuments();

    res.json({
      clients: clientsCount,
      operateurs: operateursCount,
      films: filmsCount,
      Seances: SeancesCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
  }
});

// Récupérer toutes les réservations
router.get("/reservations", authAdmin, async (req, res) => {
  try {
    const { seance } = req.query;
    
    const seances = await Seance.find(seance ? { _id: seance } : {})
      .populate("film", "title")
      .populate("reservations.user", "name email")
      .select("film date time reservations");
    
    const reservations = [];
    
    seances.forEach(seance => {
      seance.reservations.forEach(r => {
        reservations.push({
          _id: r._id,
          user: r.user,
          film: seance.film.title,
          date: seance.date,
          time: seance.time,
          row: r.row,
          seat: r.seat,
          reservationDate: r.reservationDate,
          seanceId: seance._id
        });
      });
    });
    
    reservations.sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));
    
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des réservations" });
  }
});

module.exports = router;
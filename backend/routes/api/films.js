const express = require("express");
const router = express.Router();
const Film = require("../../models/Film");
const authMiddleware = require("../../middleware/authOperatorOrAdmin");
const multer = require("multer");
const path = require("path");

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Seules les images (jpeg, jpg, png, gif) sont autorisées"));
  }
});

// Ajouter un film avec upload d'affiche
router.post("/add", authMiddleware, upload.single('poster'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      duration, 
      language, 
      genre, 
      imageUrl,
      trailer,
      director,
      releaseYear
    } = req.body;
    
    // Validation des champs requis
    if (!title || !description || !duration || !language || !genre || !releaseYear) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis" });
    }

    const posterPath = req.file ? req.file.filename : null;
    
    const film = new Film({ 
      title, 
      description, 
      duration: parseInt(duration), 
      language, 
      genre, 
      imageUrl,
      poster: posterPath,
      trailer,
      director,
      releaseYear: parseInt(releaseYear)
    });
    
    await film.save();
    res.status(201).json({ 
      message: "Film ajouté avec succès", 
      film: {
        ...film.toObject(),
        posterUrl: posterPath ? `/uploads/${posterPath}` : null
      }
    });
  } catch (err) {
    if (err.message.includes("Seules les images")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Obtenir un film par ID
router.get("/:id", async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      return res.status(404).json({ message: "Film non trouvé" });
    }
    
    // Ajouter l'URL complète de l'affiche
    const filmWithFullUrl = {
      ...film.toObject(),
      posterUrl: film.poster ? `/uploads/${film.poster}` : null
    };
    
    res.status(200).json(filmWithFullUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voir tous les films avec URLs complètes
router.get("/", async (req, res) => {
  try {
    const films = await Film.find();
    
    const filmsWithUrls = films.map(film => ({
      ...film.toObject(),
      posterUrl: film.poster ? `http://localhost:5000/uploads/${film.poster}` : null
    }));
    
    res.status(200).json(filmsWithUrls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier un film avec option d'upload de nouvelle affiche
router.put("/:id", authMiddleware, upload.single('poster'), async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      return res.status(404).json({ message: "Film non trouvé" });
    }

    const updates = req.body;
    
    if (req.file) {
      updates.poster = req.file.filename;
    }

    const updatedFilm = await Film.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    // Renvoyer l'objet film complet avec le bon format
    res.status(200).json({ 
      message: "Film mis à jour", 
      updatedFilm: {
        ...updatedFilm.toObject(),
        posterUrl: updatedFilm.poster ? `/uploads/${updatedFilm.poster}` : null
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message.includes('validation failed') 
        ? "Erreur de validation des données" 
        : "Erreur serveur"
    });
  }
});

// Supprimer un film et son affiche
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      return res.status(404).json({ message: "Film non trouvé" });
    }

    // Supprimer l'image associée si elle existe
    if (film.poster) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../public/uploads/', film.poster);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Film.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Film et affiche supprimés avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
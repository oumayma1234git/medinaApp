const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Favorite = require('../../models/favorite');
const Film = require('../../models/Film');

// @route    POST /api/favorites/:filmId
// @desc     Ajouter/supprimer un favori
// @access   Privé
router.post('/:filmId', auth, async (req, res) => {
  try {
    // 1. Vérifier que le film existe
    const film = await Film.findById(req.params.filmId);
    if (!film) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // 2. Vérifier si déjà en favoris
    const existing = await Favorite.findOne({
      user: req.user.id,
      film: req.params.filmId
    });

    if (existing) {
      // 3a. Supprimer si existant
      await existing.deleteOne();
      return res.json({ isFavorite: false, message: 'Film retiré des favoris' });
    } else {
      // 3b. Ajouter si non existant
      const newFavorite = new Favorite({
        user: req.user.id,
        film: req.params.filmId
      });
      await newFavorite.save();
      return res.status(201).json({ 
        isFavorite: true,
        message: 'Film ajouté aux favoris',
        favorite: newFavorite
      });
    }
  } catch (err) {
    console.error('Erreur:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'ID de film invalide' });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// @route    GET /api/favorites/check/:filmId
// @desc     Vérifier si un film est en favoris
// @access   Privé
router.get('/check/:filmId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user.id,
      film: req.params.filmId
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'ID de film invalide' });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// @route    GET /api/favorites
// @desc     Récupérer tous les favoris de l'utilisateur
// @access   Privé
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('film', 'title poster imageUrl duration genre releaseYear')
      .sort({ createdAt: -1 });
      
    res.json(favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// @route    DELETE /api/favorites/:id
// @desc     Supprimer un favori par son ID
// @access   Privé
// Dans votre route DELETE (backend)
router.delete('/:filmId', auth, async (req, res) => {
  try {
    const deleted = await Favorite.findOneAndDelete({
      film: req.params.filmId,
      user: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Favori non trouvé' });
    }

    // Réponse modifiée pour inclure isFavorite
    res.json({ 
      isFavorite: false, // Ceci est essentiel
      message: 'Favori supprimé'
    });
    
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


module.exports = router;
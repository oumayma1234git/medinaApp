const express = require("express");
const authOperatorOrAdmin = require('../../middleware/authOperatorOrAdmin');
const Film = require('../../models/Film');
const Seance = require('../../models/Seance');

const router = express.Router();

// Route dashboard opérateur
router.get('/operator/dashboard', authOperatorOrAdmin, (req, res) => {
  res.json({
    success: true,
    data: "Contenu opérateur sécurisé"
  });
});

// 📊 Récupérer les statistiques (films, séances, réservations)
router.get('/stats', authOperatorOrAdmin, async (req, res) => {
  try {
    const filmsCount = await Film.countDocuments();
    const seancesCount = await Seance.countDocuments();
    
    // Calculer le nombre total de réservations
    const seancesWithReservations = await Seance.find().select('reservations');
    let reservationsCount = 0;
    seancesWithReservations.forEach(seance => {
      reservationsCount += seance.reservations.length;
    });

    res.json({
      films: filmsCount,
      seances: seancesCount,
      reservations: reservationsCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
  }
});
// 📋 Récupérer les activités récentes
// 📋 Récupérer les activités récentes
router.get('/recent-activities', authOperatorOrAdmin, async (req, res) => {
  try {
    // Récupérer les 5 dernières séances avec les informations du film
    const recentSeances = await Seance.find()
      .populate('film', 'title') // populate le titre du film
      .sort({ createdAt: -1 })
      .limit(5);

    // Récupérer les séances avec des réservations récentes
    const seancesWithReservations = await Seance.find({
      'reservations.0': { $exists: true }
    })
      .populate('film', 'title')
      .populate('reservations.user', 'username')
      .sort({ 'reservations.reservationDate': -1 })
      .limit(5);

    const activities = [];

    // ✅ Ajouter les séances récentes
    recentSeances.forEach(seance => {
      activities.push({
        type: 'seance',
        message: `Nouvelle séance ajoutée pour "${seance.film?.title || 'Film inconnu'}"`,
        timestamp: seance.createdAt,
        details: {
          date: seance.date,
          time: seance.time
        }
      });
    });

    // ✅ Ajouter les réservations récentes
    seancesWithReservations.forEach(seance => {
      const sortedReservations = seance.reservations.sort((a, b) => 
        new Date(b.reservationDate) - new Date(a.reservationDate)
      );

      sortedReservations.slice(0, 2).forEach(reservation => {
        activities.push({
          type: 'reservation',
          message: `Réservation confirmée pour "${seance.film?.title || 'Film inconnu'}" par ${reservation.user?.username || 'un client'}`,
          timestamp: reservation.reservationDate,
          details: {
            client: reservation.user?.username || 'Client',
            places: 1
          }
        });
      });
    });

    // Trier les activités par date (du plus récent au plus ancien)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Retourner les 10 activités les plus récentes
    res.json(activities.slice(0, 10));
  } catch (err) {
    console.error("Erreur détaillée:", err);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des activités récentes",
      error: err.message 
    });
  }
});

// 🎬 Gestion des films

// Créer un film
router.post("/films/add", authOperatorOrAdmin, async (req, res) => {
  try {
    const { title, description, duration, genre, director, cast, poster } = req.body;

    if (!title || !description || !duration) {
      return res.status(400).json({ message: "Titre, description et durée sont requis." });
    }

    const newFilm = new Film({
      title,
      description,
      duration,
      genre: genre || "Non spécifié",
      director: director || "Inconnu",
      cast: cast || [],
      poster: poster || ""
    });

    await newFilm.save();
    res.status(201).json({ message: "Film créé avec succès", film: newFilm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier un film
router.put("/films/:id", authOperatorOrAdmin, async (req, res) => {
  try {
    const film = await Film.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!film) {
      return res.status(404).json({ message: "Film non trouvé" });
    }

    res.status(200).json({ message: "Film modifié avec succès", film });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un film
router.delete("/films/:id", authOperatorOrAdmin, async (req, res) => {
  try {
    const film = await Film.findByIdAndDelete(req.params.id);

    if (!film) {
      return res.status(404).json({ message: "Film non trouvé" });
    }

    // Supprimer aussi toutes les séances associées à ce film
    await Seance.deleteMany({ film: req.params.id });

    res.status(200).json({ message: "Film et ses séances supprimés avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lister tous les films
router.get("/films", authOperatorOrAdmin, async (req, res) => {
  try {
    const films = await Film.find().sort({ createdAt: -1 });
    res.status(200).json({ films });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🕐 Gestion des séances

// Créer une séance
router.post("/seances/add", authOperatorOrAdmin, async (req, res) => {
  try {
    const { film, date, time, room, totalSeats } = req.body;

    if (!film || !date || !time || !room || !totalSeats) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si le film existe
    const filmExists = await Film.findById(film);
    if (!filmExists) {
      return res.status(404).json({ message: "Film non trouvé" });
    }

    const newSeance = new Seance({
      film,
      date,
      time,
      room,
      totalSeats,
      availableSeats: totalSeats,
      reservations: []
    });

    await newSeance.save();
    
    // Populer les informations du film pour la réponse
    await newSeance.populate('film', 'title duration');
    
    res.status(201).json({ message: "Séance créée avec succès", seance: newSeance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier une séance
router.put("/seances/:id", authOperatorOrAdmin, async (req, res) => {
  try {
    const seance = await Seance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('film', 'title duration');

    if (!seance) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    res.status(200).json({ message: "Séance modifiée avec succès", seance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer une séance
router.delete("/seances/:id", authOperatorOrAdmin, async (req, res) => {
  try {
    const seance = await Seance.findByIdAndDelete(req.params.id);

    if (!seance) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    res.status(200).json({ message: "Séance supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lister toutes les séances avec les infos des films
router.get("/seances", authOperatorOrAdmin, async (req, res) => {
  try {
    const seances = await Seance.find()
      .populate('film', 'title duration poster')
      .sort({ date: 1, time: 1 });
    
    res.status(200).json({ seances });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📋 Récupérer les réservations (avec filtrage par séance)
// 📋 Récupérer les réservations (avec filtrage par séance)
router.get("/reservations", authOperatorOrAdmin, async (req, res) => {
  try {
    const { seance } = req.query;

    // Récupérer toutes les séances avec leurs réservations et peupler le user
    const seancesData = await Seance.find(seance ? { _id: seance } : {})
      .populate("film", "title") // Populer le titre du film
      .populate("reservations.user", "username email") // Populer le user dans chaque réservation
      .select("film date time room reservations");

    // Transformer les données pour un affichage plus simple
    const reservations = [];

    seancesData.forEach(seanceItem => {
      seanceItem.reservations.forEach(r => {
        reservations.push({
          _id: r._id,
          user: r.user, // maintenant c'est un objet complet { username, email }
          film: seanceItem.film ? seanceItem.film.title : "Film supprimé",
          date: seanceItem.date,
          time: seanceItem.time,
          room: seanceItem.room,
          row: r.row,
          seat: r.seat,
          reservationDate: r.reservationDate,
          seanceId: seanceItem._id
        });
      });
    });

    // Trier par date de réservation (plus récent en premier)
    reservations.sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des réservations", error: error.message });
  }
});


module.exports = router;
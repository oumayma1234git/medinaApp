const express = require("express");
const router = express.Router();
const Seance = require("../../models/Seance");
const Film = require("../../models/Film");
const Salle = require("../../models/Salle");
const authMiddleware = require("../../middleware/auth");

// Ajouter une séance
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { filmId, date, time, prix } = req.body;

    const film = await Film.findById(filmId);
    if (!film) return res.status(404).json({ message: "Film non trouvé" });

    const salle = await Salle.findOne();
    if (!salle) return res.status(404).json({ message: "Aucune salle trouvée" });

    // 🛑 Vérifier que la date/heure n'est pas dans le passé
    const now = new Date();
    const startTime = new Date(`${date}T${time}`);
    if (startTime < now) {
      return res.status(400).json({ message: "Impossible de créer une séance dans le passé." });
    }

    const endTime = new Date(startTime.getTime() + film.duration * 60000);

    const existingSeances = await Seance.find({ date }).populate("film");
    const conflict = existingSeances.some(s => {
      const sStart = new Date(`${s.date}T${s.time}`);
      const sEnd = new Date(sStart.getTime() + s.film.duration * 60000);
      return (startTime < sEnd && endTime > sStart);
    });

    if (conflict) {
      return res.status(400).json({ message: "Conflit avec une autre séance existante" });
    }

    const copiedSeats = salle.seats.map(seat => ({
      row: seat.row,
      number: seat.number,
      available: true,
    }));

    const seance = new Seance({
      film: filmId,
      date,
      time,
      prix,
      seats: copiedSeats
    });

    await seance.save();
    res.status(201).json({ message: "Séance ajoutée avec succès", seance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voir toutes les séances (avec filtre par film)
router.get("/", async (req, res) => {
  try {
    // Créer un objet de filtre
    const filter = {};
    if (req.query.film) {
      filter.film = req.query.film;
    }
    
    const seances = await Seance.find(filter).populate("film");
    res.status(200).json(seances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... le reste du fichier reste inchangé ...

// Supprimer une séance
// Supprimer une séance
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const deletedSeance = await Seance.findByIdAndDelete(req.params.id);
    if (!deletedSeance) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }
    res.status(200).json({ message: "Séance supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Horaires disponibles pour une date
router.get("/available-times", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date requise en paramètre" });

    const startHour = 10;
    const endHour = 23;
    let slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const seances = await Seance.find({ date }).populate("film");
    const available = slots.filter(slot => {
      const slotStart = new Date(`${date}T${slot}`);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
      return !seances.some(s => {
        const sStart = new Date(`${s.date}T${s.time}`);
        const sEnd = new Date(sStart.getTime() + s.film.duration * 60000);
        return slotStart < sEnd && slotEnd > sStart;
      });
    });

    res.status(200).json({ date, availableTimes: available });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des horaires disponibles" });
  }
});
// 🎟️ Réserver des sièges (déplacé de user.js)
router.post("/reserve", authMiddleware, async (req, res) => {
  try {
    const { seanceId, seats } = req.body;
    const userId = req.user.id;

    const seance = await Seance.findById(seanceId);
    if (!seance) return res.status(404).json({ message: "Séance non trouvée" });

    // Vérifier tous les sièges avant modification
    for (const s of seats) {
      const seat = seance.seats.find(
        seat => seat.row === s.row && seat.number === s.number
      );
      
      if (!seat) {
        return res.status(404).json({ message: `Siège ${s.row}${s.number} introuvable` });
      }
      if (!seat.available) {
        return res.status(400).json({ message: `Siège ${s.row}${s.number} déjà réservé` });
      }
    }

    // Réserver les sièges
    for (const s of seats) {
      const seat = seance.seats.find(
        seat => seat.row === s.row && seat.number === s.number
      );

      seat.available = false;
      seat.reservedBy = userId;
      seat.reservedAt = new Date();

      seance.reservations.push({
        user: userId,
        row: seat.row,
        seat: seat.number,
        reservationDate: new Date()
      });
    }

    await seance.save();
    res.status(200).json({ 
      message: `${seats.length} sièges réservés avec succès.`,
      reservationIds: seance.reservations
        .slice(-seats.length)
        .map(r => r._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la réservation" });
  }
});

// Ajouter cette nouvelle route juste après la route GET "/"
router.get("/:id", async (req, res) => {
  try {
    const seance = await Seance.findById(req.params.id).populate("film");
    if (!seance) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }
    res.status(200).json(seance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer une séance par ID
router.get("/:id", async (req, res) => {
  try {
    const seance = await Seance.findById(req.params.id).populate("film");
    if (!seance) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }
    res.status(200).json(seance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Mettre à jour une séance
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { filmId, date, time, prix } = req.body;
    const seanceId = req.params.id;

    // Vérifier si la séance existe
    const existingSeance = await Seance.findById(seanceId);
    if (!existingSeance) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    const film = await Film.findById(filmId);
    if (!film) return res.status(404).json({ message: "Film non trouvé" });

    // 🛑 Vérifier que la date/heure n'est pas dans le passé
    const now = new Date();
    const startTime = new Date(`${date}T${time}`);
    if (startTime < now) {
      return res.status(400).json({ message: "Impossible de modifier une séance dans le passé." });
    }

    const endTime = new Date(startTime.getTime() + film.duration * 60000);

    // Vérifier les conflits avec d'autres séances (en excluant la séance actuelle)
    const existingSeances = await Seance.find({ 
      date, 
      _id: { $ne: seanceId } 
    }).populate("film");
    
    const conflict = existingSeances.some(s => {
      const sStart = new Date(`${s.date}T${s.time}`);
      const sEnd = new Date(sStart.getTime() + s.film.duration * 60000);
      return (startTime < sEnd && endTime > sStart);
    });

    if (conflict) {
      return res.status(400).json({ message: "Conflit avec une autre séance existante" });
    }

    // Mettre à jour la séance
    const updatedSeance = await Seance.findByIdAndUpdate(
      seanceId,
      {
        film: filmId,
        date,
        time,
        prix
      },
      { new: true } // Retourner le document mis à jour
    ).populate("film");

    res.status(200).json({ 
      message: "Séance mise à jour avec succès", 
      seance: updatedSeance 
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la séance:", err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

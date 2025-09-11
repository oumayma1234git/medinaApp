const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const Seance = require("../../models/Seance");
const User = require("../../models/User");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { generateToken } = require('../../utils/jwt');


// ❌ Annuler une réservation par ID
router.delete("/cancel/:reservationId", authMiddleware, async (req, res) => {
  try {
    const reservationId = req.params.reservationId;
    const userId = req.user.id;

    // Trouver la séance contenant la réservation
    const seance = await Seance.findOne({ "reservations._id": reservationId });
    if (!seance) return res.status(404).json({ message: "Réservation non trouvée" });

    // Trouver la réservation spécifique
    const reservation = seance.reservations.id(reservationId);
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée" });
    
    // Vérifier que l'utilisateur est propriétaire
    if (reservation.user.toString() !== userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Libérer le siège
    const seat = seance.seats.find(s => 
      s.row === reservation.row && 
      s.number === reservation.seat
    );
    
    if (seat) {
      seat.available = true;
      seat.reservedBy = null;
      seat.reservedAt = null;
    }

    // Supprimer la réservation
    seance.reservations.pull(reservationId);
    await seance.save();

    res.status(200).json({ message: "Réservation annulée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'annulation" });
  }
});
// 📥 Obtenir toutes les réservations de l'utilisateur avec leurs ID
router.get("/my-reservations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const seances = await Seance.find({ "reservations.user": userId })
      .populate("film", "titre")
      .select("film date time reservations");

    const results = [];

    seances.forEach(seance => {
      seance.reservations.forEach(r => {
        if (r.user.toString() === userId) {
          results.push({
            id: r._id,  // <-- ajoute l'ID ici
            film: seance.film.titre,
            date: seance.date,
            time: seance.time,
            row: r.row,
            seat: r.seat,
            reservationDate: r.reservationDate
          });
        }
      });
    });

    res.status(200).json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des réservations" });
  }
});

// 🗑️ Supprimer une réservation (optionnel, par l'admin par exemple)
router.delete("/delete-reservation", authMiddleware, async (req, res) => {
  try {
    const { seanceId, row, seat } = req.body;
    const userId = req.user.id;

    const seance = await Seance.findById(seanceId);
    if (!seance) return res.status(404).json({ message: "Séance non trouvée" });

    const targetSeat = seance.seats.find(
      s => s.row === row && s.number === seat && s.reservedBy?.toString() === userId
    );
    if (!targetSeat) return res.status(404).json({ message: "Réservation introuvable" });

    targetSeat.available = true;
    targetSeat.reservedBy = null;
    targetSeat.reservedAt = null;

    seance.reservations = seance.reservations.filter(
      r => !(r.user.toString() === userId && r.row === row && r.seat === seat)
    );

    await seance.save();
    res.status(200).json({ message: "Réservation supprimée avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la réservation" });
  }
});

//qr code reservation

router.get("/reservation/:id/qrcode", authMiddleware, async (req, res) => {
  try {
    const reservationId = req.params.id;

    // Parcourir toutes les séances contenant la réservation
    const seances = await Seance.find({ "reservations._id": reservationId })
      .populate("film");

    if (!seances.length) {
      return res.status(404).json({ message: "Réservation non trouvée." });
    }

    const seance = seances[0]; // La séance contenant la réservation
    const reservation = seance.reservations.find(
      r => r._id.toString() === reservationId
    );

    const user = await User.findById(reservation.user);

    // Vérifier si l'utilisateur connecté est bien celui de la réservation
    if (req.user.role === "client" && reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès interdit à cette réservation." });
    }

    // Construire les données pour le QR code
    const qrData = `Réservation ID: ${reservation._id}
Nom: ${user.username}
Film: ${seance.film.title}
Séance: ${seance.date} - ${seance.time}
Siège: ${reservation.row}${reservation.seat}`;

    // Générer le QR Code
    const qrImage = await QRCode.toDataURL(qrData);

    // Générer le PDF
    const doc = new PDFDocument();
    const filename = `reservation-${reservation._id}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);
    doc.fontSize(20).text("Détails de la Réservation", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(qrData);
    doc.moveDown();
    doc.image(qrImage, { width: 200, align: "center" });
    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la génération du PDF" });
  }
});

// 🔄 Modifier une réservation
router.put("/modify/:reservationId", authMiddleware, async (req, res) => {
  try {
    const { newSeats } = req.body;
    const reservationId = req.params.reservationId;
    const userId = req.user.id;

    // Trouver la séance contenant la réservation
    const seance = await Seance.findOne({ "reservations._id": reservationId });
    if (!seance) return res.status(404).json({ message: "Réservation non trouvée" });

    // Trouver la réservation spécifique
    const reservation = seance.reservations.id(reservationId);
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée" });
    
    // Vérifier que l'utilisateur est propriétaire
    if (reservation.user.toString() !== userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Libérer l'ancien siège
    const oldSeat = seance.seats.find(s => 
      s.row === reservation.row && 
      s.number === reservation.seat
    );
    
    if (oldSeat) {
      oldSeat.available = true;
      oldSeat.reservedBy = null;
      oldSeat.reservedAt = null;
    }

    // Mettre à jour avec les nouveaux sièges
    if (newSeats.length > 0) {
      const newSeat = newSeats[0];
      reservation.row = newSeat.row;
      reservation.seat = newSeat.number;

      // Réserver le nouveau siège
      const seat = seance.seats.find(s => 
        s.row === newSeat.row && 
        s.number === newSeat.number
      );
      
      if (seat) {
        if (!seat.available) {
          return res.status(400).json({ message: "Siège déjà réservé" });
        }
        seat.available = false;
        seat.reservedBy = userId;
        seat.reservedAt = new Date();
      }
    }

    await seance.save();
    res.status(200).json({ message: "Réservation modifiée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la modification" });
  }
});


//maj
// Fonction de validation des données de mise à jour
const validateUserUpdate = (updateData) => {
  const errors = {};
  let isValid = true;

  // Validation de l'email
  if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
    errors.email = 'Format d\'email invalide';
    isValid = false;
  }

  // Validation du téléphone
  if (updateData.phone && !/^\+?[\d\s-]{10,}$/.test(updateData.phone)) {
    errors.phone = 'Format de téléphone invalide (ex: +212612345678)';
    isValid = false;
  }

  // Validation de la date de naissance
  if (updateData.birthDate && new Date(updateData.birthDate) > new Date()) {
    errors.birthDate = 'La date ne peut pas être dans le futur';
    isValid = false;
  }

  return { isValid, errors };
};

// Mise à jour du profil utilisateur
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    // Validation des données
    const { isValid, errors } = validateUserUpdate(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // Liste des champs autorisés à être mis à jour
    const allowedUpdates = {
         civility: req.body.civility,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      postalCode: req.body.postalCode,
      city: req.body.city,
      country: req.body.country,
      birthDate: req.body.birthDate
    };

    // Mise à jour de l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: allowedUpdates },
      { 
        new: true,
        runValidators: true,
        select: '-password -__v' // Exclure les champs sensibles
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Réponse
    const response = {
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    };

    // Si l'email a changé, générer un nouveau token
    if (req.body.email) {
      const token = generateToken(updatedUser);
      response.token = token;
      response.message = 'Profil et token mis à jour (email modifié)';
    }

    res.json(response);

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    
    // Gestion spécifique des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Erreur de validation', errors });
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message 
    });
  }
});

// routes/api/users.js
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v -tokens');
      
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
module.exports = router;

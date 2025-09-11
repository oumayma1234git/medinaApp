// models/Seance.js
const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  number: { type: Number, required: true },
  available: { type: Boolean, default: true },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservedAt: { type: Date }
});

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  row: String,
  seat: Number,
  reservationDate: { type: Date, default: Date.now }
});

const SeanceSchema = new mongoose.Schema({
  film: { type: mongoose.Schema.Types.ObjectId, ref: "Film", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  prix: { type: Number, required: true },
  seats: [seatSchema],
  reservations: [reservationSchema],
  createdAt: { type: Date, default: Date.now } // Ajout du champ createdAt
}, {
  timestamps: true // Optionnel: ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model("Seance", SeanceSchema);
const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  number: { type: Number, required: true },
  available: { type: Boolean, default: true },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservedAt: { type: Date }
});

const salleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalRows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },
  seats: [seatSchema]
});

module.exports = mongoose.model("Salle", salleSchema);

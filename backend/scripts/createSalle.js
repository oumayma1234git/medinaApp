const mongoose = require('mongoose');
const config = require('../config/config'); // adapte le chemin selon ton projet
const Salle = require('../models/Salle');   // adapte le chemin

async function createSalle() {
  await mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const rows = 'ABCDEFGHIJKLMNO'.split(''); // 15 lettres
  const seats = [];

  rows.forEach(row => {
    for (let num = 1; num <= 23; num++) {
      seats.push({
        row: row,
        number: num,
        available: true
      });
    }
  });

  const salle = new Salle({
    name: 'Salle 1',
    totalRows: 15,
    seatsPerRow: 23,
    seats: seats
  });

  await salle.save();
  console.log('Salle créée avec succès');

  mongoose.disconnect();
}

createSalle();

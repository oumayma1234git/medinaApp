// models/Film.js
const mongoose = require("mongoose");

const FilmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // Durée en minutes
  language: { type: String },
  genre: { type: String },
  imageUrl: { type: String }, // URL de l'affiche
  // Ajouter les champs manquants
  poster: { type: String }, // URL de l'affiche en grand format
  trailer: { type: String }, // ID YouTube de la bande-annonce
  director: { type: String }, // Réalisateur
  releaseYear: { type: Number } // Année de sortie
});

module.exports = mongoose.model("Film", FilmSchema);
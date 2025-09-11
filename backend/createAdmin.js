// ✅ createAdmin.js corrigé
const mongoose = require("mongoose");
const User = require("./models/User"); // ajuster le chemin si besoin
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB");
    return new User({
      username: "admin",
      email: "admin@example.com",
      password: "admin123", // 💡 pas de hash ici
      role: "admin",
    }).save();
  })
  .then(() => {
    console.log("✅ Admin créé avec succès !");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Erreur :", err);
    process.exit(1);
  });

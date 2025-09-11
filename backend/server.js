const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // Import manquant
const config = require("./config/config");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes
const authRouter = require('./routes/api/auth');
const adminRoutes = require("./routes/api/admin");
const filmRoutes = require("./routes/api/films");
const seanceRoutes = require("./routes/api/seances");
const userRoutes = require("./routes/api/user");
const favoriteRoutes = require('./routes/api/favorites');
const operatorRoutes = require('./routes/api/operatorRoutes');

// Configuration pour servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes API
app.use('/api/favorites', favoriteRoutes);
app.use("/api/user", userRoutes);
app.use("/api/films", filmRoutes);
app.use("/api/seances", seanceRoutes);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/operatorRoutes", operatorRoutes);

// Connexion à MongoDB
mongoose.connect(config.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => {
    console.error("Erreur de connexion MongoDB", err);
    process.exit(1);
  });

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
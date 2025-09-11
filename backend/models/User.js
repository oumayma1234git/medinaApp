const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  // Informations de base
  username: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Validation simple d'email
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} n'est pas un email valide!`
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  role: { 
    type: String, 
    enum: ["client", "admin", "operateur"], 
    required: true,
    default: "client"
  },
  
  // Ajout du champ CIN pour les opérateurs
  cin: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Permet plusieurs documents sans CIN (null)
    validate: {
      validator: function(v) {
        // Validation conditionnelle : requis seulement pour les opérateurs
        if (this.role === "operateur") {
          return v && v.length >= 6;
        }
        return true;
      },
      message: "CIN requis et doit faire au moins 6 caractères pour un opérateur"
    }
  },

  // Informations personnelles
  civility: {
    type: String,
    enum: ["Monsieur", "Madame", ""],
    default: ""
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function(v) {
        // L'utilisateur doit avoir au moins 13 ans
        return v <= new Date(new Date().setFullYear(new Date().getFullYear() - 13));
      },
      message: "Vous devez avoir au moins 13 ans!"
    }
  },

  // Coordonnées
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: "Numéro de téléphone invalide!"
    }
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  postalCode: {
    type: String,
    trim: true,
    maxlength: 10
  },
  city: {
    type: String,
    trim: true,
    maxlength: 50
  },
  country: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  // Active les timestamps automatiques
  timestamps: true
});

// Middleware pour mettre à jour updatedAt avant chaque save
UserSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

// Hachage du mot de passe avant de sauvegarder
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour vérifier le mot de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Validation conditionnelle selon le rôle
UserSchema.pre("validate", function(next) {
  if (this.role === "client" || this.role === "admin") {
    if (!this.email) {
      this.invalidate("email", "Email requis pour un client ou admin");
    }
  }

  if (this.role === "operateur") {
    if (!this.cin) {
      this.invalidate("cin", "CIN requis pour un opérateur");
    }
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
require("dotenv").config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/cinemaDB",
  JWT_SECRET: process.env.JWT_SECRET || "monsecret",
  PORT: process.env.PORT || 5000,
};




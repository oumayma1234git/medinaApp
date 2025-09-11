// utils/jwt.js
const jwt = require('jsonwebtoken');
const config = require("../config/config");

module.exports = {
  generateToken: (user) => {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      config.JWT_SECRET,
      { expiresIn: '30d' }
    );
  },
  verifyToken: (token) => {
    return jwt.verify(token, config.JWT_SECRET);
  }
};
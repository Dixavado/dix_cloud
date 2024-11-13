// models/Account.js

const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  url: { type: String, required: true },
  username: { type: String, required: true },
  passwords: [{ type: String, required: true }] // Array de senhas
});

// Removido o índice único

module.exports = mongoose.model('Account', accountSchema);

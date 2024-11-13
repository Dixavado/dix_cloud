// routes/accountRoutes.js

const express = require('express');
const router = express.Router();
const { addOrUpdateAccount } = require('../controllers/cloud');

// Rota para cadastrar ou atualizar uma conta
router.post('/add', addOrUpdateAccount);

module.exports = router;

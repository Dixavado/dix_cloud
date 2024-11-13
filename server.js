// app.js
const express = require('express');
const compression = require('compression'); // Para reduzir o tamanho das respostas HTTP
const helmet = require('helmet'); // Para aumentar a segurança HTTP
const connectDB = require('./config/db');
const accountRoutes = require('./routes/routes');
const app = express();
require('dotenv').config();


// Configuração do middleware
app.use(express.json());
app.use(compression()); // Ativa compressão GZIP para respostas
app.use(helmet()); // Protege contra vulnerabilidades comuns

// Conexão com o banco de dados
connectDB();

// Middleware para rotas de contas
app.use('/', accountRoutes);

// Configuração da porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

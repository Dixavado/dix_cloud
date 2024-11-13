// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI || 'mongodb+srv://diixavado:6256811a@dixavado.5dfhh.mongodb.net/cloud?retryWrites=true&w=majority&appName=dixavado';
    await mongoose.connect(dbURI, {
      // Melhorar a performance de leitura
      socketTimeoutMS: 30000, // Tempo de espera pela conexão
      connectTimeoutMS: 30000, // Tempo para estabelecer a conexão
    });
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1); // Fecha a aplicação caso haja falha na conexão
  }
};

module.exports = connectDB;

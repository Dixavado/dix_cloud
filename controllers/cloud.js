const Account = require('../models/Account');

// Função para cadastrar ou atualizar senha
const addOrUpdateAccount = async (req, res) => {
  const { url, username, password } = req.body;

  // Validação de entrada
  if (!url || !username || !password) {
    return res.status(400).json({ error: 'Por favor, forneça URL, usuário e senha' });
  }

  try {
    // Usando upsert para combinar criação ou atualização em uma única operação
    const result = await Account.updateOne(
      { url, username }, // Filtra a conta pela URL e Username
      {
        $addToSet: { passwords: password }, // Adiciona a senha, evitando duplicatas
      },
      { upsert: true, new: true } // Cria um novo documento caso não exista
    );

    // Verifica se foi criado ou atualizado
    if (result.upsertedCount > 0) {
      return res.status(201).json({ message: 'Conta cadastrada com sucesso' });
    } else {
      return res.status(200).json({ message: 'Senha atualizada com sucesso' });
    }

  } catch (error) {
    console.error('Erro ao salvar os dados:', error);
    return res.status(500).json({ error: 'Erro ao salvar os dados' });
  }
};

module.exports = { addOrUpdateAccount };

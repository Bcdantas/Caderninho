// CAMINHO: caderninho-backend/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users.js');
const User = require('./models/User.js');
const connectDB = require('./config/db.js');

dotenv.config();

connectDB();

// Função para importar os dados
const importData = async () => {
  try {
    // 1. Apaga todos os usuários existentes
    await User.deleteMany();
    console.log('Usuários antigos removidos...');

    // 2. Insere os novos usuários do nosso arquivo de dados
    // Usamos User.create para garantir que a criptografia de senha seja ativada
    await User.create(users);
    console.log('Novos usuários importados com sucesso!');

    process.exit();
  } catch (error) {
    console.error(`Erro ao importar dados: ${error}`);
    process.exit(1);
  }
};

// Função para destruir os dados
const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log('Todos os usuários foram destruídos.');
    process.exit();
  } catch (error) {
    console.error(`Erro ao destruir dados: ${error}`);
    process.exit(1);
  }
};

// Lógica para decidir se vamos importar ou destruir os dados
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
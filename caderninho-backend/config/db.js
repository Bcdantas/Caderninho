// CONTEÚDO PARA O ARQUIVO: caderninho-backend/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Tenta se conectar ao banco de dados usando a URL do arquivo .env
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
        process.exit(1); // Encerra a aplicação em caso de falha na conexão
    }
};

module.exports = connectDB;
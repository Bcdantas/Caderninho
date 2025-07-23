require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express'); // Importa o Express
const mongoose = require('mongoose'); // Importa o Mongoose para o MongoDB
const cors = require('require('cors')); // Importa o CORS para comunicação entre front e back

const app = express(); // Inicializa o Express
const PORT = process.env.PORT || 4000; // Define a porta do servidor, ou 4000 por padrão
const MONGO_URI = process.env.MONGO_URI; // Pega a string de conexão do MongoDB do .env

// Middlewares (regras para todas as requisições)
app.use(cors()); // Permite requisições de outras origens
app.use(express.json()); // Permite que o servidor entenda dados em formato JSON

// Conexão com o MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado com sucesso ao MongoDB Atlas!'))
    .catch(err => console.error('Erro de conexão com o MongoDB:', err));

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('API Caderninho está funcionando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
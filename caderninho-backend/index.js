require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express'); // Importa o Express
const mongoose = require('mongoose'); // Importa o Mongoose para o MongoDB
const cors = require('cors'); // Importa o CORS para comunicação entre front e back

const app = express(); // Inicializa o Express
const PORT = process.env.PORT || 4000; // Define a porta do servidor, ou 4000 por padrão
const MONGO_URI = process.env.MONGO_URI; // Pega a string de conexão do MongoDB do .env

const userRoutes = require('./routes/userRoutes'); // Importa as rotas de usuário

const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const debtRoutes = require('./routes/debtRoutes');

const reportRoutes = require('./routes/reportRoutes');
const { protect } = require('./middleware/authMiddleware'); // Importa o middleware

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

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/debts', debtRoutes);
// Novas rotas de relatórios, todas protegidas
app.use('/api/reports', protect, reportRoutes); // Todas as rotas de relatório usarão 'protect'

// Iniciar o servidor
const HOST = '0.0.0.0'; 
app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando na porta ${PORT} no endereço ${HOST}`);
    // REMOVIDO: A linha problemática de console.log com os.networkInterfaces() para evitar erro
});
// Carrega as variáveis do arquivo .env
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importar as rotas
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const debtRoutes = require('./routes/debts'); // <-- NOVA LINHA

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors()); // Permite a comunicação entre o front e o back
app.use(express.json()); // Permite que o servidor entenda JSON

// Conexão com o MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Conectado com sucesso ao MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('Erro ao conectar com o MongoDB:', err);
  });

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor do Caderninho está no ar!');
});

// Usar as rotas
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/debts', debtRoutes); // <-- NOVA LINHA

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
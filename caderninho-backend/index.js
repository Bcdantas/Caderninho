// CAMINHO: caderninho-backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Importação de TODAS as rotas
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const debtRoutes = require('./routes/debtRoutes');
const reportRoutes = require('./routes/reportRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // <<< ROTA QUE FALTAVA IMPORTAR

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0'; 

// Middlewares
app.use(cors());
app.use(express.json());


// Função para iniciar o servidor
const startServer = async () => {
  try {
    // 1. Conecta ao banco de dados e ESPERA a conexão ser concluída
    await connectDB();
    
    // 2. Registra TODAS as rotas da API
    app.use('/api/users', userRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/debts', debtRoutes);
    app.use('/api/expenses', expenseRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/payments', paymentRoutes); // <<< ROTA QUE FALTAVA USAR

    // 3. SÓ DEPOIS, inicia o servidor para ouvir por requisições
    app.listen(PORT, HOST, () => {
      console.log(`Servidor rodando na porta ${PORT} no endereço ${HOST}`);
    });

  } catch (error) {
    console.error("Falha ao iniciar o servidor", error);
    process.exit(1);
  }
};

// Chama a função para iniciar o servidor
startServer();
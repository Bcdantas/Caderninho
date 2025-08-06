// CAMINHO: caderninho-backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
// Importa a lógica do controller
const { getPayments } = require('../controllers/paymentController');
// Corrige a sintaxe da importação do middleware
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Rota para obter todos os pagamentos
// Apenas administradores podem acessar esta rota
// Corrige a sintaxe da chamada de authorizeRoles
router.route('/').get(protect, authorizeRoles('admin'), getPayments);

module.exports = router;
// CAMINHO: caderninho-backend/routes/caixaRoutes.js

const express = require('express');
const router = express.Router();
const { openCaixa, getCaixaStatus, addTransaction, closeCaixa } = require('../controllers/caixaController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Rota para abrir o caixa
router.route('/open').post(protect, authorizeRoles('admin'), openCaixa);

// Rota para obter o status do caixa
router.route('/status').get(protect, authorizeRoles('admin'), getCaixaStatus);

// Rota para adicionar uma transação manual (entrada/saída)
router.route('/transaction').post(protect, authorizeRoles('admin'), addTransaction);

// Rota para fechar o caixa
router.route('/close').post(protect, authorizeRoles('admin'), closeCaixa);

module.exports = router;
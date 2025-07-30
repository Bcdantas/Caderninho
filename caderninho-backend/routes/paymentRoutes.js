const express = require('express');
const router = express.Router();
const { getPayments } = require('../controllers/paymentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Rota para obter todos os pagamentos
// Apenas administradores podem acessar esta rota
router.route('/').get(protect, authorizeRoles(['admin']), getPayments);

module.exports = router;
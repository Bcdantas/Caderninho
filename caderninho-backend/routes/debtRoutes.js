// CAMINHO: caderninho-backend/routes/debtRoutes.js

const express = require('express');
const router = express.Router();
const { getDebtsSummary, payCustomerDebt, processExpiredOrders } = require('../controllers/debtController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/summary')
    .get(protect, authorizeRoles('admin', 'employee'), getDebtsSummary);

router.route('/customer/:customerId/pay')
    .post(protect, authorizeRoles('admin', 'employee'), payCustomerDebt);

// NOVO ENDPOINT: para processar pedidos expirados
router.route('/process-expired')
    .post(protect, authorizeRoles('admin'), processExpiredOrders);

module.exports = router;
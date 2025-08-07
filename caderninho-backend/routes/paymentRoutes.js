// CAMINHO: caderninho-backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { getPayments } = require('../controllers/paymentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorizeRoles('admin'), getPayments);

module.exports = router;
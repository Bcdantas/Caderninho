// CAMINHO: caderninho-backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getOrders, getOrderById, createOrder, updateOrder, payForOrder, deleteOrder, sendToDebt } = require('../controllers/orderController');

router.route('/')
    .get(protect, getOrders)
    .post(protect, createOrder);

router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, updateOrder)
    .delete(protect, deleteOrder);

router.route('/:id/pay').put(protect, payForOrder);
router.route('/:id/send-to-debt').post(protect, sendToDebt); // <-- NOVA ROTA

module.exports = router;
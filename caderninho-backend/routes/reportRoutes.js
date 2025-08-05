// CAMINHO: caderninho-backend/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Debt = require('../models/Debt');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { 
    startOfDay, endOfDay, startOfWeek, endOfWeek, 
    startOfMonth, endOfMonth, subDays 
} = require('date-fns');

const calculateProfit = async (startDate, endDate) => {
    const result = await Payment.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

router.get('/profit-summary', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const now = new Date();
        const yesterday = subDays(now, 1);
        const [todayProfit, yesterdayProfit, thisWeekProfit, thisMonthProfit, totalProfit] = await Promise.all([
            calculateProfit(startOfDay(now), endOfDay(now)),
            calculateProfit(startOfDay(yesterday), endOfDay(yesterday)),
            calculateProfit(startOfWeek(now, { weekStartsOn: 0 }), endOfWeek(now, { weekStartsOn: 0 })),
            calculateProfit(startOfMonth(now), endOfMonth(now)),
            calculateProfit(new Date(0), now)
        ]);
        res.json({
            today: todayProfit, yesterday: yesterdayProfit,
            thisWeek: thisWeekProfit, thisMonth: thisMonthProfit, total: totalProfit
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao calcular lucros.' });
    }
});

router.get('/high-debts', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const highDebts = await Debt.aggregate([
            { $match: { isPaid: false } },
            { $group: { _id: '$customer', totalDebt: { $sum: '$amount' } } },
            { $match: { totalDebt: { $gt: 100 } } },
            { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customerDetails' } },
            { $unwind: '$customerDetails' },
            { $project: { _id: 0, customerId: '$_id', customerName: '$customerDetails.name', totalDebt: 1 } },
            { $sort: { totalDebt: -1 } }
        ]);
        res.json(highDebts);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar débitos altos' });
    }
});

// @desc    Obter os 3 itens mais vendidos (ROBUSTO)
// @route   GET /api/reports/top-selling-items
router.get('/top-selling-items', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const topSellingItems = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 3 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
            // =======================================================
            // ## CORREÇÃO APLICADA AQUI ##
            // Esta opção evita que o sistema quebre se um produto do pedido não for encontrado
            { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
            // =======================================================
            { $match: { productDetails: { $exists: true, $ne: null } } }, // Garante que apenas produtos existentes sejam mostrados
            { $project: { _id: 0, name: '$productDetails.name', totalSold: 1 } }
        ]);
        res.json(topSellingItems);
    } catch (error) {
        console.error('Erro ao buscar itens mais vendidos:', error.message);
        res.status(500).json({ message: 'Erro ao buscar itens mais vendidos' });
    }
});

module.exports = router;
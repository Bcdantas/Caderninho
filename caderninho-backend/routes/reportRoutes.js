// CAMINHO: caderninho-backend/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Debt = require('../models/Debt');
const Product = require('../models/Product');
const Payment = require('../models/Payment');

// Importa as funções de data que vamos usar da biblioteca 'date-fns'
const { 
    startOfDay, 
    endOfDay, 
    startOfWeek, 
    endOfWeek, 
    startOfMonth, 
    endOfMonth, 
    subDays 
} = require('date-fns');

/**
 * Função auxiliar para calcular o lucro em um período de tempo.
 */
const calculateProfit = async (startDate, endDate) => {
    const result = await Payment.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

// =========================================================================
// ## ROTA PRINCIPAL PARA A NOVA PÁGINA DE LUCROS ##
// =========================================================================
// @desc    Obter um resumo dos lucros por período
// @route   GET /api/reports/profit-summary
// @access  Private (Admin)
router.get('/profit-summary', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const now = new Date();
        const yesterday = subDays(now, 1);

        const [todayProfit, yesterdayProfit, thisWeekProfit, thisMonthProfit, totalProfit] = await Promise.all([
            calculateProfit(startOfDay(now), endOfDay(now)),
            calculateProfit(startOfDay(yesterday), endOfDay(yesterday)),
            calculateProfit(startOfWeek(now, { weekStartsOn: 0 }), endOfWeek(now, { weekStartsOn: 0 })),
            calculateProfit(startOfMonth(now), endOfMonth(now)),
            calculateProfit(new Date(0), now) // Lucro total
        ]);

        res.json({
            today: todayProfit,
            yesterday: yesterdayProfit,
            thisWeek: thisWeekProfit,
            thisMonth: thisMonthProfit,
            total: totalProfit
        });

    } catch (error) {
        console.error('Erro ao calcular resumo de lucros:', error.message);
        res.status(500).json({ message: 'Erro no servidor ao calcular lucros.' });
    }
});


// =========================================================================
// ## ROTAS ADICIONAIS PARA O DASHBOARD (Mantidas do seu arquivo original) ##
// =========================================================================

// @desc    Obter débitos maiores que R$ 100
// @route   GET /api/reports/high-debts
router.get('/high-debts', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        // Esta agregação é mais eficiente para buscar o total de dívidas por cliente
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

// @desc    Obter os 3 itens mais vendidos
// @route   GET /api/reports/top-selling-items
router.get('/top-selling-items', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const topSellingItems = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 3 },
            { $lookup: { from: 'products', localField: '$_id', foreignField: '_id', as: 'productDetails' } },
            { $unwind: '$productDetails' },
            { $project: { _id: 0, name: '$productDetails.name', totalSold: 1 } }
        ]);
        res.json(topSellingItems);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar itens mais vendidos' });
    }
});


module.exports = router;
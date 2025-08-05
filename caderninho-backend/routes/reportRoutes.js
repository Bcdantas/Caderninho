// CAMINHO: caderninho-backend/routes/reportRoutes.js
// VERSÃO DE DEPURAÇÃO PARA ENCONTRAR ROTAS LENTAS

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Debt = require('../models/Debt');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');

const { 
    startOfDay, endOfDay, startOfWeek, endOfWeek, 
    startOfMonth, endOfMonth, subDays 
} = require('date-fns');

// --- Funções Auxiliares ---
const calculateGains = async (startDate, endDate) => {
    const result = await Payment.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

const calculateLosses = async (startDate, endDate) => {
    const result = await Expense.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
};


// --- Rotas da API ---

// @desc    Obter um resumo financeiro completo (Ganhos, Perdas, Lucro Líquido)
// @route   GET /api/reports/profit-summary
router.get('/profit-summary', protect, authorizeRoles('admin'), async (req, res) => {
    console.log("==> [DEBUG] Iniciando busca /profit-summary...");
    try {
        const now = new Date();
        const yesterday = subDays(now, 1);

        const [
            todayGains, yesterdayGains, thisWeekGains, thisMonthGains, totalGains,
            todayLosses, yesterdayLosses, thisWeekLosses, thisMonthLosses, totalLosses
        ] = await Promise.all([
            calculateGains(startOfDay(now), endOfDay(now)),
            calculateGains(startOfDay(yesterday), endOfDay(yesterday)),
            calculateGains(startOfWeek(now, { weekStartsOn: 0 }), endOfWeek(now)),
            calculateGains(startOfMonth(now), endOfMonth(now)),
            calculateGains(new Date(0), now),
            calculateLosses(startOfDay(now), endOfDay(now)),
            calculateLosses(startOfDay(yesterday), endOfDay(yesterday)),
            calculateLosses(startOfWeek(now, { weekStartsOn: 0 }), endOfWeek(now)),
            calculateLosses(startOfMonth(now), endOfMonth(now)),
            calculateLosses(new Date(0), now),
        ]);

        console.log("<== [DEBUG] Busca /profit-summary CONCLUÍDA.");
        res.json({
            today:     { gains: todayGains, losses: todayLosses, net: todayGains - todayLosses },
            yesterday: { gains: yesterdayGains, losses: yesterdayLosses, net: yesterdayGains - yesterdayLosses },
            thisWeek:  { gains: thisWeekGains, losses: thisWeekLosses, net: thisWeekGains - thisWeekLosses },
            thisMonth: { gains: thisMonthGains, losses: thisMonthLosses, net: thisMonthGains - thisMonthLosses },
            total:     { gains: totalGains, losses: totalLosses, net: totalGains - totalLosses }
        });

    } catch (error) {
        console.error("XXX [DEBUG] Erro em /profit-summary:", error.message);
        res.status(500).json({ message: 'Erro no servidor ao calcular resumo financeiro.' });
    }
});


// @desc    Obter débitos maiores que R$ 100
// @route   GET /api/reports/high-debts
router.get('/high-debts', protect, authorizeRoles('admin'), async (req, res) => {
    console.log("==> [DEBUG] Iniciando busca /high-debts...");
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
        console.log("<== [DEBUG] Busca /high-debts CONCLUÍDA.");
        res.json(highDebts);
    } catch (error) {
        console.error("XXX [DEBUG] Erro em /high-debts:", error.message);
        res.status(500).json({ message: 'Erro ao buscar débitos altos' });
    }
});


// @desc    Obter os 3 itens mais vendidos
// @route   GET /api/reports/top-selling-items
router.get('/top-selling-items', protect, authorizeRoles('admin'), async (req, res) => {
    console.log("==> [DEBUG] Iniciando busca /top-selling-items...");
    try {
        const topSellingItems = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 3 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
            { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
            { $match: { productDetails: { $exists: true, $ne: null } } },
            { $project: { _id: 0, name: '$productDetails.name', totalSold: 1 } }
        ]);
        console.log("<== [DEBUG] Busca /top-selling-items CONCLUÍDA.");
        res.json(topSellingItems);
    } catch (error) {
        console.error("XXX [DEBUG] Erro em /top-selling-items:", error.message);
        res.status(500).json({ message: 'Erro ao buscar itens mais vendidos' });
    }
});

module.exports = router;
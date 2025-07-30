const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Debt = require('../models/Debt');

// @desc    Obter lucro total de todos os tempos
// @route   GET /api/reports/total-profit
// @access  Private (Admin only)
router.get('/total-profit', protect, authorize(['admin']), async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $match: { isPaid: true } }, // Apenas pedidos pagos
            {
                $group: {
                    _id: null,
                    totalProfit: { $sum: '$paidAmount' } // Soma o valor pago
                }
            }
        ]);

        res.json({ totalProfit: result.length > 0 ? result[0].totalProfit : 0 });
    } catch (error) {
        console.error('Erro ao calcular lucro total:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao calcular lucro total', error: error.message });
    }
});

// @desc    Obter lucro dos pedidos pagos HOJE
// @route   GET /api/reports/today-profit
// @access  Private (Admin only)
router.get('/today-profit', protect, authorize(['admin']), async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // Início do dia (00:00:00)

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // Fim do dia (23:59:59)

        const result = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    paymentDate: { $gte: startOfToday, $lte: endOfToday } // Pedidos pagos hoje
                }
            },
            {
                $group: {
                    _id: null,
                    todayProfit: { $sum: '$paidAmount' } // Soma o valor pago
                }
            }
        ]);

        res.json({ todayProfit: result.length > 0 ? result[0].todayProfit : 0 });
    } catch (error) {
        console.error('Erro ao calcular lucro de hoje:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao calcular lucro de hoje', error: error.message });
    }
});

// @desc    Obter o número de dívidas criadas HOJE e que estão NÃO PAGAS
// @route   GET /api/reports/today-unpaid-debts-count
// @access  Private (Admin only)
router.get('/today-unpaid-debts-count', protect, authorize(['admin']), async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // Início do dia (00:00:00)

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // Fim do dia (23:59:59)

        const count = await Debt.countDocuments({
            isPaid: false,
            createdAt: { $gte: startOfToday, $lte: endOfToday } // Dívidas criadas hoje
        });

        res.json({ todayUnpaidDebtsCount: count });
    } catch (error) {
        console.error('Erro ao contar fiados de hoje:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao contar fiados de hoje', error: error.message });
    }
});

module.exports = router;
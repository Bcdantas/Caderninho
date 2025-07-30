const express = require('express');
const router = express.Router();
// Importa o protect e o authorizeRoles do middleware
// ESTA LINHA É CRUCIAL: protect e authorizeRoles DEVEM ESTAR AQUI
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); 
const Order = require('../models/Order'); // Verifique: seu arquivo é 'Order.js'?
const Debt = require('../models/Debt');
const Product = require('../models/Product'); // Para top-selling-items

// @desc    Obter lucro total de todos os tempos
// @route   GET /api/reports/total-profit
// @access  Private (Admin only)
router.get('/total-profit', protect, authorizeRoles('admin'), async (req, res) => { // <<-- AGORA DEVE FUNCIONAR AQUI
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
router.get('/today-profit', protect, authorizeRoles('admin'), async (req, res) => { // <<-- E AQUI NA LINHA 33
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
router.get('/today-unpaid-debts-count', protect, authorizeRoles('admin'), async (req, res) => {
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

// @desc    Obter o lucro (total de vendas pagas) do dia anterior
// @route   GET /api/reports/daily-profit
// @access  Private (Admin)
router.get('/daily-profit', protect, authorizeRoles('admin'), async (req, res) => { // Mantido essa rota se precisar do lucro de ONTEM
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const endOfYesterday = new Date(today);
        endOfYesterday.setDate(today.getDate() - 1);
        endOfYesterday.setHours(23, 59, 59, 999);

        const totalSalesYesterday = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    paymentDate: { $gte: yesterday, $lte: endOfYesterday } // Ajustado para paymentDate
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$paidAmount' } // Ajustado para paidAmount
                }
            }
        ]);

        const profit = totalSalesYesterday.length > 0 ? totalSalesYesterday[0].total : 0;
        res.json({ profitYesterday: profit });

    } catch (error) {
        console.error('Erro ao buscar lucro do dia anterior:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar lucro do dia anterior', error: error.message });
    }
});

// @desc    Obter débitos maiores que R$ 100 com nome do cliente (todos pendentes, filtro no front)
// @route   GET /api/reports/high-debts
// @access  Private (Admin)
router.get('/high-debts', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const highDebts = await Debt.find({
            isPaid: false, // Apenas dívidas pendentes
        })
        .populate('customer', 'name');

        res.json(highDebts);

    } catch (error) {
        console.error('Erro ao buscar débitos altos:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar débitos altos', error: error.message });
    }
});

// @desc    Obter os 3 itens mais vendidos
// @route   GET /api/reports/top-selling-items
// @access  Private (Admin)
router.get('/top-selling-items', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const topSellingItems = await Order.aggregate([
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: 3
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    name: '$productDetails.name',
                    totalSold: 1
                }
            }
        ]);

        res.json(topSellingItems);

    } catch (error) {
        console.error('Erro ao buscar itens mais vendidos:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar itens mais vendidos', error: error.message });
    }
});


module.exports = router;
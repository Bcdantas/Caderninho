const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Order = require('../models/Order'); // Verifique: seu arquivo é 'Order.js'?
const Debt = require('../models/Debt'); // Verifique: seu arquivo é 'Debt.js'?
const Product = require('../models/Product'); // Verifique: seu arquivo é 'Product.js'?
const Payment = require('../models/Payment'); // <<-- NOVO: Modelo de Pagamento

// @desc    Obter lucro total de todos os tempos
// @route   GET /api/reports/total-profit
// @access  Private (Admin only)
router.get('/total-profit', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await Payment.aggregate([ // <<-- MUDANÇA: AGORA USA Payment
            {
                $group: {
                    _id: null,
                    totalProfit: { $sum: '$amount' } // Soma o campo 'amount' do Payment
                }
            }
        ]);

        res.json({ totalProfit: result.length > 0 ? result[0].totalProfit : 0 });
    } catch (error) {
        console.error('Erro ao calcular lucro total (Payment):', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao calcular lucro total', error: error.message });
    }
});

// @desc    Obter lucro dos pedidos pagos HOJE
// @route   GET /api/reports/today-profit
// @access  Private (Admin only)
router.get('/today-profit', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // Início do dia (00:00:00)

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // Fim do dia (23:59:59)

        const result = await Payment.aggregate([ // <<-- MUDANÇA: AGORA USA Payment
            {
                $match: {
                    paymentDate: { $gte: startOfToday, $lte: endOfToday } // Filtra por paymentDate
                }
            },
            {
                $group: {
                    _id: null,
                    todayProfit: { $sum: '$amount' } // Soma o campo 'amount' do Payment
                }
            }
        ]);

        res.json({ todayProfit: result.length > 0 ? result[0].todayProfit : 0 });
    } catch (error) {
        console.error('Erro ao calcular lucro de hoje (Payment):', error.message);
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

// @desc    Obter lista de dívidas criadas HOJE e NÃO PAGAS, agrupadas por cliente
// @route   GET /api/reports/today-unpaid-debts
// @access  Private (Admin only)
router.get('/today-unpaid-debts', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // Início do dia (00:00:00)

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // Fim do dia (23:59:59)

        const result = await Debt.aggregate([
            {
                $match: {
                    isPaid: false, // Apenas dívidas pendentes
                    createdAt: { $gte: startOfToday, $lte: endOfToday } // Dívidas criadas hoje
                }
            },
            {
                $lookup: { // "Join" com a coleção de clientes para pegar o nome
                    from: 'customers', // Nome da coleção no DB (minúsculas, plural)
                    localField: 'customer',
                    foreignField: '_id',
                    as: 'customerDetails'
                }
            },
            {
                $unwind: '$customerDetails' // Desmembra o array de detalhes do cliente (será 1)
            },
            {
                $group: {
                    _id: '$customerDetails._id', // Agrupa por ID do cliente
                    customerName: { $first: '$customerDetails.name' }, // Pega o nome do cliente
                    totalDebtToday: { $sum: '$amount' }, // Soma o valor das dívidas de hoje para o cliente
                }
            },
            {
                $project: { // Seleciona apenas os campos desejados
                    _id: 0, // Exclui o _id do grupo
                    customerId: '$_id',
                    customerName: 1,
                    totalDebtToday: 1
                }
            },
            {
                $sort: { totalDebtToday: -1 } // Opcional: Ordena por maior dívida
            }
        ]);

        res.json(result);
    } catch (error) {
        console.error('Erro ao buscar fiados de hoje detalhados:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar fiados de hoje detalhados', error: error.message });
    }
});

// @desc    Obter o lucro (total de vendas pagas) do dia anterior
// @route   GET /api/reports/daily-profit
// @access  Private (Admin)
router.get('/daily-profit', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const endOfYesterday = new Date(today);
        endOfYesterday.setDate(today.getDate() - 1);
        endOfYesterday.setHours(23, 59, 59, 999);

        const totalSalesYesterday = await Payment.aggregate([ // <<-- MUDANÇA: AGORA USA Payment
            {
                $match: {
                    paymentDate: { $gte: yesterday, $lte: endOfYesterday } // Filtra por paymentDate
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' } // Soma o campo 'amount' do Payment
                }
            }
        ]);

        const profit = totalSalesYesterday.length > 0 ? totalSalesYesterday[0].total : 0;
        res.json({ profitYesterday: profit });

    } catch (error) {
        console.error('Erro ao buscar lucro do dia anterior (Payment):', error.message);
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
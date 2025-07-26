const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Para buscar pedidos
const Debt = require('../models/Debt');   // Para buscar dívidas
const Product = require('../models/Product'); // Para buscar detalhes do produto

// Middleware de proteção de rota (autenticação) - Vamos usar aqui
const { protect } = require('../middleware/authMiddleware'); // <<-- AINDA NÃO TEMOS ISSO, ADICIONAREMOS NO PRÓXIMO PASSO!

// @desc    Obter o lucro (total de vendas pagas) do dia anterior
// @route   GET /api/reports/daily-profit
// @access  Private (Admin)
router.get('/daily-profit', protect, async (req, res) => {
    try {
        // Lógica para calcular o lucro do dia anterior
        // Consideraremos "lucro" como o total de pedidos pagos no dia anterior para simplificar.
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); // Define para o dia anterior
        yesterday.setHours(0, 0, 0, 0); // Início do dia anterior

        const endOfYesterday = new Date(today);
        endOfYesterday.setDate(today.getDate() - 1);
        endOfYesterday.setHours(23, 59, 59, 999); // Fim do dia anterior

        const totalSalesYesterday = await Order.aggregate([
            {
                $match: {
                    isPaid: true, // Apenas pedidos pagos
                    createdAt: { $gte: yesterday, $lte: endOfYesterday } // Dentro do período
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' } // Soma o totalAmount de cada pedido
                }
            }
        ]);

        const profit = totalSalesYesterday.length > 0 ? totalSalesYesterday[0].total : 0;
        res.json({ profitYesterday: profit });

    } catch (error) {
        console.error('Erro ao buscar lucro do dia anterior:', error);
        res.status(500).json({ message: 'Erro ao buscar lucro do dia anterior', error: error.message });
    }
});

// @desc    Obter débitos maiores que R$ 100 com nome do cliente
// @route   GET /api/reports/high-debts
// @access  Private (Admin)
router.get('/high-debts', protect, async (req, res) => {
    try {
        const highDebts = await Debt.find({
            isPaid: false, // Apenas dívidas pendentes
            amount: { $gt: 100 } // Maiores que R$ 100
        })
        .populate('customer', 'name'); // Popula apenas o nome do cliente

        res.json(highDebts);

    } catch (error) {
        console.error('Erro ao buscar débitos altos:', error);
        res.status(500).json({ message: 'Erro ao buscar débitos altos', error: error.message });
    }
});

// @desc    Obter os 3 itens mais vendidos
// @route   GET /api/reports/top-selling-items
// @access  Private (Admin)
router.get('/top-selling-items', protect, async (req, res) => {
    try {
        const topSellingItems = await Order.aggregate([
            {
                $unwind: '$items' // Desmembra o array 'items' para ter um documento por item de pedido
            },
            {
                $group: {
                    _id: '$items.product', // Agrupa por ID do produto
                    totalSold: { $sum: '$items.quantity' } // Soma a quantidade vendida de cada produto
                }
            },
            {
                $sort: { totalSold: -1 } // Ordena do maior para o menor
            },
            {
                $limit: 3 // Limita aos 3 primeiros
            },
            {
                $lookup: { // "Join" com a coleção de produtos para pegar o nome
                    from: 'products', // Nome da coleção no DB (minúsculas, plural)
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails' // Desmembra o array de detalhes do produto (será 1)
            },
            {
                $project: { // Seleciona apenas os campos desejados
                    _id: 0, // Exclui o _id do grupo
                    productId: '$_id',
                    name: '$productDetails.name',
                    totalSold: 1
                }
            }
        ]);

        res.json(topSellingItems);

    } catch (error) {
        console.error('Erro ao buscar itens mais vendidos:', error);
        res.status(500).json({ message: 'Erro ao buscar itens mais vendidos', error: error.message });
    }
});

module.exports = router;
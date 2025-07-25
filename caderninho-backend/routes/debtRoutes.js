const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt'); // Importa o modelo de Dívida

// Middleware de proteção de rota (autenticação) - AINDA NÃO TEMOS
// const { protect } = require('../middleware/authMiddleware');

// @desc    Obter todas as dívidas (opcionalmente filtradas por pago/não pago)
// @route   GET /api/debts?isPaid=true/false
// @access  Private (futuramente)
router.get('/', async (req, res) => {
    try {
        let filter = {};
        if (req.query.isPaid !== undefined) {
            filter.isPaid = req.query.isPaid === 'true';
        } else {
            filter.isPaid = false; // Por padrão, busca apenas dívidas não pagas
        }

        const debts = await Debt.find(filter)
            .populate('customer', 'name phone') // Popula dados do cliente
            .populate({
                path: 'order', // Popula o pedido
                populate: {
                    path: 'items.product', // Dentro do pedido, popula os produtos dos itens
                    select: 'name price' // Seleciona apenas nome e preço do produto
                }
            });

        res.json(debts);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dívidas', error: error.message });
    }
});

// @desc    Obter uma dívida específica por ID
// @route   GET /api/debts/:id
// @access  Private (futuramente)
router.get('/:id', async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id)
            .populate('customer', 'name phone')
            .populate({
                path: 'order',
                populate: {
                    path: 'items.product',
                    select: 'name price'
                }
            });

        if (debt) {
            res.json(debt);
        } else {
            res.status(404).json({ message: 'Dívida não encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dívida', error: error.message });
    }
});

// @desc    Marcar uma dívida como paga (geralmente via rota de pedido, mas aqui é direto)
// @route   PUT /api/debts/:id/pay
// @access  Private (futuramente)
router.put('/:id/pay', async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);

        if (debt) {
            debt.isPaid = true;
            await debt.save();

            // Opcional: Marcar o pedido associado como pago também, para consistência.
            // Isso é redundante se você usar a rota /api/orders/:id/pay, mas é bom para garantir.
            const order = await Order.findById(debt.order);
            if (order && !order.isPaid) {
                order.isPaid = true;
                await order.save();
            }

            res.json({ message: 'Dívida marcada como paga com sucesso!', debt });
        } else {
            res.status(404).json({ message: 'Dívida não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao marcar dívida como paga', error: error.message });
    }
});

module.exports = router;
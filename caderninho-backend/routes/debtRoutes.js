const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Payment = require('../models/Payment');
const Order = require('../models/Order') // <<-- ADICIONE ESTA LINHA!
const Debt = require('../models/Debt'); // Já existente
const Customer = require('../models/Customer');


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
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);

        if (!debt) {
            return res.status(404).json({ message: 'Dívida não encontrada.' });
        }
        if (debt.isPaid) {
            return res.status(400).json({ message: 'Esta dívida já está paga.' });
        }

        // --- ATUALIZAÇÃO DO PEDIDO E CRIAÇÃO DO PAGAMENTO ---
        const order = await Order.findById(debt.order); // Busca o pedido associado

        if (order) { // Se o pedido existe
            if (order.isPaid) {
                return res.status(400).json({ message: 'O pedido associado já foi pago.' });
            }
            order.isPaid = true; // Marca o pedido como pago
            // O paidAmount e paymentMethod/Date serão gravados no novo modelo Payment
            await order.save();
        } else {
            // Se o pedido não existir (referência órfã), ainda marcamos a dívida como paga
            console.warn(`Dívida ${debt._id} marcada como paga, mas Pedido associado (${debt.order}) não encontrado.`);
        }

        // --- Criar um NOVO Registro de Pagamento para esta dívida ---
        const payment = new Payment({
            customer: debt.customer, // Cliente da dívida
            order: debt.order,       // Pedido associado à dívida
            amount: debt.amount,     // Valor total da dívida
            paymentMethod: 'Dinheiro', // Padrão 'Dinheiro' ao pagar pela dívida
            paymentDate: new Date(),   // Data/hora atual do pagamento
        });
        await payment.save(); // Salva o registro de pagamento

        debt.isPaid = true; // Marca a dívida como paga APÓS o pagamento ser registrado
        await debt.save();

        // --- Atualizar a Dívida Total do Cliente ---
        const customer = await Customer.findById(debt.customer);
        if (customer) {
            // A dívida do cliente é reduzida pelo valor da dívida paga
            customer.totalDebt -= debt.amount;
            await customer.save();
        }

        res.json({ message: 'Dívida e pedido marcados como pagos e pagamento registrado com sucesso!', debt });
    } catch (error) {
        console.error('Erro ao marcar dívida como paga (debtRoutes):', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao marcar dívida como paga', error: error.message });
    }
});
module.exports = router;
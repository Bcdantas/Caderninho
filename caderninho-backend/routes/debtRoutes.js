// CAMINHO: caderninho-backend/routes/debtRoutes.js

const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');
const Order = require('../models/Order'); // Importante para sincronização
const Payment = require('../models/Payment'); // Importante para registrar o lucro
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// @desc    Obter todas as dívidas PENDENTES
// @route   GET /api/debts
router.get('/', protect, authorizeRoles('admin', 'employee'), async (req, res) => {
    try {
        const debts = await Debt.find({ isPaid: false })
            .populate('customer', 'name')
            .populate({
                path: 'order',
                select: 'items totalAmount',
                populate: { path: 'items.product', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json(debts);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dívidas' });
    }
});

// @desc    Marcar uma dívida como paga
// @route   PUT /api/debts/:id/pay
router.put('/:id/pay', protect, authorizeRoles('admin', 'employee'), async (req, res) => {
    const { paymentMethod } = req.body;

    try {
        const debt = await Debt.findById(req.params.id);
        if (!debt) return res.status(404).json({ message: 'Dívida não encontrada.' });
        if (debt.isPaid) return res.status(400).json({ message: 'Esta dívida já foi paga.' });

        // Etapa 1: Atualiza o status da Dívida
        debt.isPaid = true;
        await debt.save();

        // Etapa 2: Cria um registro de Pagamento para o controle de lucro
        const payment = new Payment({
            customer: debt.customer,
            order: debt.order,
            amount: debt.amount,
            paymentMethod: paymentMethod || 'Dinheiro',
        });
        await payment.save();
        
        // Etapa 3: Sincroniza o Pedido associado, marcando-o como pago também
        await Order.findByIdAndUpdate(debt.order, { isPaid: true });

        res.json({ message: 'Dívida paga e pedido atualizado com sucesso!' });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar pagamento da dívida' });
    }
});

module.exports = router;
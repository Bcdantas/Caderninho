// CAMINHO: caderninho-backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Debt = require('../models/Debt');
const Payment = require('../models/Payment');

// @desc    Obter todos os pedidos
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let filter = {};
        if (req.query.isPaid !== undefined) {
            filter.isPaid = req.query.isPaid === 'true';
        }

        const orders = await Order.find(filter)
            .populate('customer', 'name phone')
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
    }
});

// @desc    Obter um pedido por ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name phone')
            .populate('items.product', 'name price');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Pedido não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pedido por ID', error: error.message });
    }
});

// @desc    Criar um novo pedido
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    const { customerId, items } = req.body;

    if (!customerId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Cliente e itens do pedido são obrigatórios.' });
    }

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            }
            if (item.quantity <= 0) {
                return res.status(400).json({ message: `Quantidade inválida para o produto ${product.name}.` });
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtOrder: product.price
            });
            totalAmount += product.price * item.quantity;
        }

        const order = new Order({
            customer: customerId,
            items: orderItems,
            totalAmount: totalAmount,
            isPaid: false
        });

        const createdOrder = await order.save();

        const debt = new Debt({
            customer: customerId,
            order: createdOrder._id,
            amount: totalAmount,
            isPaid: false
        });
        await debt.save();

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
    }
});

// @desc    Atualizar um pedido
// @route   PUT /api/orders/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { customerId, items } = req.body;
    
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });
        if (order.isPaid) return res.status(400).json({ message: 'Não é possível editar um pedido já pago.' });

        if (customerId && customerId !== order.customer.toString()) {
            const newCustomer = await Customer.findById(customerId);
            if (!newCustomer) return res.status(404).json({ message: 'Novo cliente não encontrado.' });
            order.customer = customerId;
        }
        
        let totalAmount = 0;
        const newOrderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            if (item.quantity <= 0) return res.status(400).json({ message: `Quantidade inválida para o produto ${product.name}.` });
            
            newOrderItems.push({ product: product._id, quantity: item.quantity, priceAtOrder: product.price });
            totalAmount += product.price * item.quantity;
        }

        order.items = newOrderItems;
        order.totalAmount = totalAmount;

        const updatedOrder = await order.save();

        await Debt.findOneAndUpdate(
            { order: updatedOrder._id, isPaid: false },
            { amount: totalAmount },
            { new: true }
        );

        res.json(updatedOrder);

    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar pedido', error: error.message });
    }
});

// @desc    Marcar pedido como pago e registrar pagamento
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    const { paidAmount, paymentMethod } = req.body;

    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });
        if (order.isPaid) return res.status(400).json({ message: 'Este pedido já foi pago.' });

        if (typeof paidAmount !== 'number' || paidAmount <= 0) return res.status(400).json({ message: 'Valor pago inválido.' });
        if (!paymentMethod) return res.status(400).json({ message: 'Método de pagamento é obrigatório.' });

        // PASSO 1: Marcar o Pedido como Pago
        order.isPaid = true;
        await order.save();

        // PASSO 2: Criar um NOVO Registro de Pagamento
        const payment = new Payment({
            customer: order.customer,
            order: order._id,
            amount: paidAmount,
            paymentMethod: paymentMethod,
            paymentDate: new Date(),
        });
        await payment.save();

        // PASSO 3 (A CORREÇÃO): Atualizar a Dívida associada
        await Debt.findOneAndUpdate({ order: order._id }, { isPaid: true });

        // PASSO 4: Atualizar a Dívida Total no cadastro do Cliente
        const customer = await Customer.findById(order.customer);
        if (customer) {
            customer.totalDebt -= order.totalAmount; 
            await customer.save();
        }

        res.json({
            message: 'Pedido marcado como pago e dívida atualizada com sucesso!',
            order: order,
            payment: payment,
            customerDebt: customer ? customer.totalDebt : null,
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar pagamento do pedido', error: error.message });
    }
});

// @desc    Deletar um pedido (e sua dívida associada)
// @route   DELETE /api/orders/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (order) {
            await Debt.deleteOne({ order: order._id });
            res.json({ message: 'Pedido e dívida associada removidos com sucesso.' });
        } else {
            res.status(404).json({ message: 'Pedido não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar pedido', error: error.message });
    }
});

module.exports = router;
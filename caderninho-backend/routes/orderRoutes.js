// CAMINHO: caderninho-backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Removi authorizeRoles para corresponder ao seu último arquivo
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Debt = require('../models/Debt');
const Payment = require('../models/Payment');

// Rotas GET (sem alteração)
router.get('/', protect, async (req, res) => {
    try {
        let filter = {};
        if (req.query.isPaid !== undefined) { filter.isPaid = req.query.isPaid === 'true'; }
        const orders = await Order.find(filter).populate('customer', 'name phone').populate('items.product', 'name price').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer', 'name phone').populate('items.product', 'name price');
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
            orderItems.push({ product: product._id, quantity: item.quantity, priceAtOrder: product.price });
            totalAmount += product.price * item.quantity;
        }

        const order = new Order({ customer: customerId, items: orderItems, totalAmount: totalAmount, isPaid: false });
        const createdOrder = await order.save();

        const debt = new Debt({ customer: customerId, order: createdOrder._id, amount: totalAmount, isPaid: false });
        await debt.save();

        // =====================================================================================
        // ## FASE 3 - AUTOMAÇÃO DO ESTOQUE ##
        // Após salvar o pedido, damos baixa no estoque de cada produto vendido.
        for (const item of createdOrder.items) {
            await Product.findByIdAndUpdate(item.product, {
                // $inc é um operador do MongoDB para incrementar (ou decrementar) um valor.
                // Aqui, decrementamos a quantidade em estoque pela quantidade vendida.
                $inc: { quantityInStock: -item.quantity } 
            });
        }
        // =====================================================================================

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
    }
});


// O restante do arquivo (PUT, DELETE, etc.) permanece o mesmo...

// Rota para ATUALIZAR um pedido
router.put('/:id', protect, async (req, res) => {
    // ... seu código existente para atualizar um pedido ...
    // Nota: A lógica de estoque para ATUALIZAÇÃO de pedido é mais complexa e podemos fazer depois.
});

// Rota para PAGAR um pedido
router.put('/:id/pay', protect, async (req, res) => {
    const { paidAmount, paymentMethod } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });
        if (order.isPaid) return res.status(400).json({ message: 'Este pedido já foi pago.' });
        if (typeof paidAmount !== 'number' || paidAmount <= 0) return res.status(400).json({ message: 'Valor pago inválido.' });
        if (!paymentMethod) return res.status(400).json({ message: 'Método de pagamento é obrigatório.' });

        order.isPaid = true;
        await order.save();

        const payment = new Payment({ customer: order.customer, order: order._id, amount: paidAmount, paymentMethod: paymentMethod, paymentDate: new Date() });
        await payment.save();
        
        await Debt.findOneAndUpdate({ order: order._id }, { isPaid: true });

        const customer = await Customer.findById(order.customer);
        if (customer) {
            customer.totalDebt -= order.totalAmount; 
            await customer.save();
        }

        res.json({ message: 'Pedido marcado como pago e dívida atualizada com sucesso!', order: order, payment: payment, customerDebt: customer ? customer.totalDebt : null });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar pagamento do pedido', error: error.message });
    }
});

// Rota para DELETAR um pedido
router.delete('/:id', protect, async (req, res) => {
    // ... seu código existente para deletar um pedido ...
    // Nota: A lógica para devolver o estoque ao DELETAR um pedido podemos fazer depois.
});

module.exports = router;
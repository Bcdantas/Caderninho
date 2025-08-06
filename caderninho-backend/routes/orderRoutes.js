// CAMINHO: caderninho-backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Debt = require('../models/Debt');
const Payment = require('../models/Payment');

// GET all orders
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

// GET order by ID
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

// POST new order
router.post('/', protect, async (req, res) => {
    const { customerId, items } = req.body;
    if (!customerId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Cliente e itens do pedido são obrigatórios.' });
    }
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) return res.status(404).json({ message: 'Cliente não encontrado.' });
        
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            if (item.quantity <= 0) return res.status(400).json({ message: `Quantidade inválida para o produto ${product.name}.` });
            orderItems.push({ product: product._id, quantity: item.quantity, priceAtOrder: product.price });
            totalAmount += product.price * item.quantity;
        }

        const order = new Order({ customer: customerId, items: orderItems, totalAmount, isPaid: false });
        const createdOrder = await order.save();
        const debt = new Debt({ customer: customerId, order: createdOrder._id, amount: totalAmount, isPaid: false });
        await debt.save();

        for (const item of createdOrder.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantityInStock: -item.quantity } 
            });
        }
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
    }
});

// PUT update order
router.put('/:id', protect, async (req, res) => {
    const { customerId, items: newItems } = req.body;
    try {
        const originalOrder = await Order.findById(req.params.id);
        if (!originalOrder) return res.status(404).json({ message: 'Pedido não encontrado.' });
        if (originalOrder.isPaid) return res.status(400).json({ message: 'Não é possível editar um pedido já pago.' });

        const originalItemsMap = new Map();
        originalOrder.items.forEach(item => {
            originalItemsMap.set(item.product.toString(), item.quantity);
        });
        const newItemsMap = new Map();
        newItems.forEach(item => {
            newItemsMap.set(item.productId.toString(), item.quantity);
        });
        const allProductIds = new Set([...originalItemsMap.keys(), ...newItemsMap.keys()]);

        for (const productId of allProductIds) {
            const originalQty = originalItemsMap.get(productId) || 0;
            const newQty = newItemsMap.get(productId) || 0;
            const difference = newQty - originalQty;
            if (difference !== 0) {
                await Product.findByIdAndUpdate(productId, {
                    $inc: { quantityInStock: -difference }
                });
            }
        }

        let totalAmount = 0;
        const processedItems = [];
        for (const item of newItems) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            if (item.quantity <= 0) return res.status(400).json({ message: `Quantidade inválida.` });
            processedItems.push({ product: product._id, quantity: item.quantity, priceAtOrder: product.price });
            totalAmount += product.price * item.quantity;
        }

        originalOrder.customer = customerId || originalOrder.customer;
        originalOrder.items = processedItems;
        originalOrder.totalAmount = totalAmount;

        const updatedOrder = await originalOrder.save();
        await Debt.findOneAndUpdate({ order: updatedOrder._id, isPaid: false }, { amount: totalAmount });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar pedido', error: error.message });
    }
});

// PUT pay for order
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

        // Cria o pagamento sem o campo 'paymentDate'
        const payment = new Payment({
            customer: order.customer,
            order: order._id,
            amount: paidAmount,
            paymentMethod: paymentMethod
        });
        await payment.save();

        await Debt.findOneAndUpdate({ order: order._id }, { isPaid: true });
        
        const customer = await Customer.findById(order.customer);
        if (customer) {
            customer.totalDebt -= order.totalAmount; 
            await customer.save();
        }
        res.json({ message: 'Pedido marcado como pago e dívida atualizada com sucesso!', order, payment, customerDebt: customer ? customer.totalDebt : null });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar pagamento do pedido', error: error.message });
    }
});

// DELETE order
router.delete('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            if (!order.isPaid) {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { quantityInStock: item.quantity }
                    });
                }
            }
            await Debt.deleteOne({ order: order._id });
            await order.deleteOne();
            res.json({ message: 'Pedido removido e estoque ajustado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Pedido não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar pedido', error: error.message });
    }
});

module.exports = router;
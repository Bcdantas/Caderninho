// CAMINHO: caderninho-backend/controllers/orderController.js

const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Caixa = require('../models/Caixa');

// @desc    Get all active orders
// @route   GET /api/orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ isPaid: false }).populate('customer', 'name phone').populate('items.product', 'name price').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
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
};

// @desc    Create new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
    const { customerId, items } = req.body;
    if (!customerId || !items || !items.length) {
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

        for (const item of createdOrder.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantityInStock: -item.quantity } 
            });
        }
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
    }
};

// @desc    Update order
// @route   PUT /api/orders/:id
const updateOrder = async (req, res) => {
    const { customerId, items: newItems } = req.body;
    try {
        const originalOrder = await Order.findById(req.params.id);
        if (!originalOrder) return res.status(404).json({ message: 'Pedido não encontrado.' });
        
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
        
        let newTotalAmount = 0;
        const processedItems = [];
        for (const item of newItems) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            if (item.quantity <= 0) return res.status(400).json({ message: `Quantidade inválida.` });
            processedItems.push({ product: product._id, quantity: item.quantity, priceAtOrder: product.price });
            newTotalAmount += product.price * item.quantity;
        }

        originalOrder.customer = customerId || originalOrder.customer;
        originalOrder.items = processedItems;
        originalOrder.totalAmount = newTotalAmount;

        const updatedOrder = await originalOrder.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar pedido', error: error.message });
    }
};

// @desc    Pay for order
// @route   PUT /api/orders/:id/pay
const payForOrder = async (req, res) => {
    const { paidAmount, paymentMethod } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });
        if (order.isPaid) return res.status(400).json({ message: 'Este pedido já foi pago.' });
        if (typeof paidAmount !== 'number' || paidAmount <= 0) return res.status(400).json({ message: 'Valor pago inválido.' });
        if (!paymentMethod) return res.status(400).json({ message: 'Método de pagamento é obrigatório.' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const caixa = await Caixa.findOne({ date: today, isClosed: false });

        if (caixa) {
            caixa.transactions.push({
                type: 'inflow',
                amount: order.totalAmount,
                description: 'Venda de produto',
                relatedOrder: order._id
            });
            await caixa.save();
        }

        order.isPaid = true;
        await order.save();

        const payment = new Payment({
            customer: order.customer,
            order: order._id,
            amount: order.totalAmount,
            paymentMethod: paymentMethod
        });
        await payment.save();
        
        await Order.deleteOne({ _id: order._id });

        res.json({ message: 'Pedido marcado como pago e removido com sucesso!', order, payment });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar pagamento do pedido', error: error.message });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantityInStock: item.quantity }
                });
            }

            await order.deleteOne();
            res.json({ message: 'Pedido removido e estoque ajustado com sucesso.' });
        } else {
            res.status(404).json({ message: 'Pedido não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar pedido', error: error.message });
    }
};

// @desc    Move an order to customer's debt
// @route   POST /api/orders/:id/send-to-debt
const sendToDebt = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });
        
        const customer = await Customer.findById(order.customer);
        if (!customer) return res.status(404).json({ message: 'Cliente não encontrado.' });

        customer.debt += order.totalAmount;
        await customer.save();

        await Order.deleteOne({ _id: order._id });
        
        res.json({ message: 'Pedido movido para a dívida do cliente com sucesso.' });
    } catch (error) {
        console.error("Erro ao mover pedido para a dívida:", error);
        res.status(500).json({ message: 'Erro ao mover pedido para a dívida.', error: error.message });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    payForOrder,
    deleteOrder,
    sendToDebt
};
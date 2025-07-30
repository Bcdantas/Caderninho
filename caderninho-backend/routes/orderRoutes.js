const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order'); // Verifique: seu arquivo é 'Order.js'?
const Customer = require('../models/Customer'); // Verifique: seu arquivo é 'Customer.js'?
const Product = require('../models/Product'); // Verifique: seu arquivo é 'Product.js'?
const Debt = require('../models/Debt');     // Verifique: seu arquivo é 'Debt.js'?

// @desc    Obter todos os pedidos (opcionalmente filtrados por pago/não pago)
// @route   GET /api/orders?isPaid=true/false
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let filter = {};
        if (req.query.isPaid !== undefined) {
            filter.isPaid = req.query.isPaid === 'true';
        }

        const orders = await Order.find(filter)
            .populate('customer', 'name phone')
            .populate('items.product', 'name price');

        res.json(orders);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error.message);
        console.error(error.stack);
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
        console.error('Erro ao buscar pedido por ID:', error.message);
        console.error(error.stack);
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
        console.error('Erro ao criar pedido:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
    }
});

// @desc    Atualizar um pedido (incluindo seus itens)
// @route   PUT /api/orders/:id
// @access  Private (Admin/Employee)
router.put('/:id', protect, async (req, res) => {
    const { customerId, items } = req.body;
    
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }

        if (order.isPaid) {
            return res.status(400).json({ message: 'Não é possível editar um pedido já pago.' });
        }

        if (customerId && customerId !== order.customer.toString()) {
            const newCustomer = await Customer.findById(customerId);
            if (!newCustomer) {
                return res.status(404).json({ message: 'Novo cliente não encontrado.' });
            }
            order.customer = customerId;
        }
        
        let totalAmount = 0;
        const newOrderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Produto com ID ${item.productId} não encontrado.` });
            }
            if (item.quantity <= 0) {
                return res.status(400).json({ message: `Quantidade inválida para o produto ${product.name}.` });
            }
            
            newOrderItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtOrder: product.price
            });
            totalAmount += product.price * item.quantity;
        }

        order.items = newOrderItems;
        order.totalAmount = totalAmount;

        const updatedOrder = await order.save();

        // Opcional: Atualizar a dívida associada, se houver e o valor total tiver mudado
        await Debt.findOneAndUpdate(
            { order: updatedOrder._id, isPaid: false },
            { amount: totalAmount },
            { new: true }
        );

        res.json(updatedOrder);

    } catch (error) {
        console.error('Erro ao atualizar pedido:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao atualizar pedido', error: error.message });
    }
});


// @desc    Marcar pedido como pago e registrar pagamento
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    // <<-- NOVO CONSOLE.LOG AQUI (LINHA 1)! -->>
    console.log('--- Requisição PUT /api/orders/:id/pay ---');
    console.log('ID do Pedido recebido:', req.params.id);
    console.log('Corpo da requisição (req.body) recebido:', req.body); // O QUE O BACKEND RECEBE
    console.log('Tipo de paidAmount em req.body:', typeof req.body.paidAmount);
    // <<--------------------------------------->>

    const { paidAmount, paymentMethod } = req.body;

    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.isPaid) {
                return res.status(400).json({ message: 'Este pedido já foi pago.' });
            }

            order.isPaid = true;

            // Converter explicitamente para Number e atribuir diretamente
            order.paidAmount = Number(paidAmount); // <<-- MUDANÇA CRUCIAL AQUI!
            order.paymentMethod = paymentMethod;
            order.paymentDate = new Date();

            // <<-- NOVO CONSOLE.LOG AQUI (LINHA 2)! -->>
            console.log('Valor de paidAmount após Number() e antes de salvar:', order.paidAmount);
            console.log('Tipo de order.paidAmount:', typeof order.paidAmount);
            console.log('Order object antes de order.save():', order); // Veja o objeto completo
            // <<--------------------------------------->>

            const updatedOrder = await order.save();

            // Atualizar a dívida total do cliente
            const customer = await Customer.findById(order.customer);
            if (customer) {
                // A dívida do cliente é reduzida pelo totalAmount do pedido,
                // independentemente do paidAmount (o troco não afeta a dívida).
                customer.totalDebt -= order.totalAmount;
                await customer.save();
            }

            res.json({
                message: 'Pedido marcado como pago com sucesso!',
                order: updatedOrder,
                customerDebt: customer ? customer.totalDebt : null,
            });
        } else {
            res.status(404).json({ message: 'Pedido não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao processar pagamento do pedido:', error.message);
        console.error(error.stack); // Para depuração detalhada
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
            // Deleta a dívida associada também
            await Debt.deleteOne({ order: order._id });
            res.json({ message: 'Pedido e dívida associada removidos com sucesso.' });
        } else {
            res.status(404).json({ message: 'Pedido não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao deletar pedido:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao deletar pedido', error: error.message });
    }
});

module.exports = router;
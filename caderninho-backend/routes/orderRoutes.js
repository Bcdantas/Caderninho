const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Importa o modelo de Pedido
const Product = require('../models/Product'); // Para buscar detalhes do produto
const Customer = require('../models/Customer'); // Para garantir que o cliente existe
const Debt = require('../models/Debt'); // Para criar dívidas

// @desc    Criar um novo pedido
// @route   POST /api/orders
// @access  Private (futuramente)
router.post('/', async (req, res) => {
    const { customerId, items } = req.body; // Pega o ID do cliente e os itens do pedido

    // Validação básica
    if (!customerId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Cliente e itens do pedido são obrigatórios.' });
    }

    try {
        // 1. Verificar se o cliente existe
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // 2. Processar cada item do pedido, buscar o preço do produto e calcular o total
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
                priceAtOrder: product.price // Salva o preço atual do produto no momento do pedido
            });
            totalAmount += product.price * item.quantity;
        }

        // 3. Criar o pedido
        const order = new Order({
            customer: customerId,
            items: orderItems,
            totalAmount: totalAmount,
            isPaid: false // Pedido nasce como não pago, gerando uma dívida
        });

        const createdOrder = await order.save();

        // 4. Criar a dívida associada a este pedido
        const debt = new Debt({
            customer: customerId,
            order: createdOrder._id,
            amount: totalAmount,
            isPaid: false
        });
        await debt.save();

        res.status(201).json(createdOrder); // Retorna o pedido criado
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
    }
});

// @desc    Obter todos os pedidos (opcionalmente filtrados por pago/não pago)
// @route   GET /api/orders?isPaid=true/false
// @access  Private (futuramente)
router.get('/', async (req, res) => {
    try {
        let filter = {};
        if (req.query.isPaid !== undefined) {
            filter.isPaid = req.query.isPaid === 'true'; // Filtra por status de pagamento
        }

        const orders = await Order.find(filter)
            .populate('customer', 'name phone') // Popula dados do cliente (apenas nome e telefone)
            .populate('items.product', 'name price'); // Popula dados do produto para cada item

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
    }
});

// @desc    Obter um pedido por ID
// @route   GET /api/orders/:id
// @access  Private (futuramente)
router.get('/:id', async (req, res) => {
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
        res.status(500).json({ message: 'Erro ao buscar pedido', error: error.message });
    }
});

// @desc    Atualizar status de pagamento de um pedido e sua dívida associada
// @route   PUT /api/orders/:id/pay
// @access  Private (futuramente)
router.put('/:id/pay', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true; // Marca o pedido como pago
            await order.save();

            // Marca a dívida associada como paga também
            await Debt.findOneAndUpdate(
                { order: order._id },
                { isPaid: true },
                { new: true } // Retorna o documento atualizado
            );

            res.json({ message: 'Pedido e dívida marcados como pagos com sucesso!', order });
        } else {
            res.status(404).json({ message: 'Pedido não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao marcar pedido como pago', error: error.message });
    }
});

// @desc    Deletar um pedido (e sua dívida associada)
// @route   DELETE /api/orders/:id
// @access  Private (futuramente)
router.delete('/:id', async (req, res) => {
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
        res.status(500).json({ message: 'Erro ao deletar pedido', error: error.message });
    }
});

module.exports = router;
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
router.put('/:id', protect, async (req, res) => { // <<-- ADICIONE ESTA ROTA
    const { customerId, items } = req.body; // Recebe o cliente e novos itens

    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }

        // Você pode adicionar verificações aqui, por exemplo, se o pedido já está pago
        if (order.isPaid) {
            return res.status(400).json({ message: 'Não é possível editar um pedido já pago.' });
        }

        // 1. Verificar se o cliente existe (se alterado ou apenas para validação)
        if (customerId && customerId !== order.customer.toString()) { // Verifica se o cliente foi alterado
            const newCustomer = await Customer.findById(customerId);
            if (!newCustomer) {
                return res.status(404).json({ message: 'Novo cliente não encontrado.' });
            }
            order.customer = customerId; // Atualiza o cliente do pedido
        }

        let totalAmount = 0;
        const newOrderItems = [];

        // 2. Processar e validar os novos itens
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
                priceAtOrder: product.price // Salva o preço atual do produto no momento da atualização
            });
            totalAmount += product.price * item.quantity;
        }

        order.items = newOrderItems;
        order.totalAmount = totalAmount; // Recalcula o total

        const updatedOrder = await order.save();

        // Opcional: Atualizar a dívida associada, se houver e o valor total tiver mudado
        await Debt.findOneAndUpdate(
            { order: updatedOrder._id, isPaid: false }, // Encontra a dívida não paga para este pedido
            { amount: totalAmount }, // Atualiza o valor da dívida
            { new: true }
        );

        res.json(updatedOrder);

    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        res.status(500).json({ message: 'Erro ao atualizar pedido', error: error.message });
    }
});
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
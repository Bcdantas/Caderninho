const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer'); // Importa o modelo de Cliente

// Middleware de proteção de rota (autenticação) - AINDA NÃO TEMOS
// const { protect } = require('../middleware/authMiddleware');

// @desc    Obter todos os clientes
// @route   GET /api/customers
// @access  Public (por enquanto)
router.get('/', protect, async (req, res) => { // <<-- ADICIONADO 'protect'
    try {
        const customers = await Customer.find({})
                                        .populate({ // Popula pedidos para calcular dívida
                                            path: 'orders', // Se Customer tiver virtual 'orders'
                                            select: 'totalAmount isPaid customer' // totalAmount e isPaid são essenciais
                                        });

        const customersWithDebt = customers.map(customer => {
            // Filtra pedidos não pagos para este cliente
            const unpaidOrders = customer.orders.filter(order => !order.isPaid);
            // Soma o totalAmount dos pedidos não pagos
            const totalDebt = unpaidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

            return {
                _id: customer._id,
                name: customer.name,
                phone: customer.phone,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
                totalDebt: totalDebt // Adiciona o campo de dívida total
            };
        });

        res.json(customersWithDebt);
    } catch (error) {
        console.error('Erro ao buscar clientes com dívida total:', error);
        res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
    }
});
        
// @desc    Obter um cliente por ID
// @route   GET /api/customers/:id
// @access  Public (por enquanto)
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id); // Busca um cliente pelo ID
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
    }
});

// @desc    Criar um novo cliente
// @route   POST /api/customers
// @access  Private (futuramente)
router.post('/', async (req, res) => { // Removido o 'protect' temporariamente
    const { name, phone } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Nome do cliente é obrigatório' });
    }

    try {
        const customer = new Customer({ name, phone });
        const createdCustomer = await customer.save(); // Salva o novo cliente no DB
        res.status(201).json(createdCustomer); // Retorna o cliente criado
    } catch (error) {
        // Se o nome do cliente já existe
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um cliente com este nome.' });
        }
        res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
    }
});

// @desc    Atualizar um cliente
// @route   PUT /api/customers/:id
// @access  Private (futuramente)
router.put('/:id', async (req, res) => { // Removido o 'protect' temporariamente
    const { name, phone } = req.body;

    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            customer.name = name || customer.name;
            customer.phone = phone !== undefined ? phone : customer.phone;

            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        // Se o novo nome do cliente já existe
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe outro cliente com este nome.' });
        }
        res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
    }
});

// @desc    Deletar um cliente
// @route   DELETE /api/customers/:id
// @access  Private (futuramente)
router.delete('/:id', async (req, res) => { // Removido o 'protect' temporariamente
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);

        if (customer) {
            res.json({ message: 'Cliente removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
    }
});

module.exports = router;
// CAMINHO: caderninho-backend/controllers/customerController.js

const Customer = require('../models/Customer');

const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({}).sort({ name: 1 });
        res.status(200).json(customers);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar clientes.' });
    }
};

const createCustomer = async (req, res) => {
    const { name, phone } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'O nome do cliente é obrigatório.' });
    }
    try {
        const customerExists = await Customer.findOne({ name });
        if (customerExists) {
            return res.status(400).json({ message: 'Já existe um cliente com este nome.' });
        }
        const customer = await Customer.create({ name, phone });
        res.status(201).json(customer);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ message: 'Erro no servidor ao criar cliente.' });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cliente por ID.' });
    }
};

const updateCustomer = async (req, res) => {
    const { name, phone } = req.body;
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            customer.name = name || customer.name;
            customer.phone = phone !== undefined ? phone : customer.phone;
            const updatedCustomer = await customer.save();
            res.status(200).json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Cliente não encontrado.' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe outro cliente com este nome.' });
        }
        res.status(500).json({ message: 'Erro ao atualizar cliente.' });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            await customer.deleteOne();
            res.status(200).json({ message: 'Cliente removido com sucesso.' });
        } else {
            res.status(404).json({ message: 'Cliente não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar cliente.' });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};
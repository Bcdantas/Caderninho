const Customer = require('../models/Customer');
const Order = require('../models/Order'); // Importa o modelo Order, necessário para popular 'orders'

// @desc    Obter todos os clientes (com pesquisa e filtro de dívida)
// @route   GET /api/customers
// @access  Private (Admin, Employee)
const getCustomers = async (req, res) => {
    const { name, minTotalDebt } = req.query; // Pega os parâmetros da URL
    const filter = {}; // Objeto para construir o filtro do MongoDB

    // Filtrar por nome (busca parcial e case-insensitive)
    if (name) {
        filter.name = { $regex: name, $options: 'i' };
    }

    // Filtrar por dívida total mínima
    // Esta filtragem será feita no backend após o cálculo do totalDebt
    // Entao, a logica de filter.totalDebt = { $gte: debtValue }; será aplicada ao resultado mapeado

    try {
        const customers = await Customer.find(filter) // Aplica filtro por nome
                                        .populate({ // Popula os pedidos do cliente para calcular a dívida
                                            path: 'orders', // O nome do virtual 'orders' no schema do Customer
                                            select: 'totalAmount isPaid' // Seleciona apenas o que precisa
                                        })
                                        .sort({ name: 1 }); // Ordena por nome
        
        // Mapeia os clientes para adicionar o totalDebt calculado via método
        let customersWithDebt = customers.map(customer => ({
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            totalDebt: customer.calculateTotalDebt(), // Uso do método calculateTotalDebt()
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        }));

        // Filtrar por dívida total mínima AGORA no backend, após o cálculo
        if (minTotalDebt) {
            const debtValue = parseFloat(minTotalDebt);
            if (!isNaN(debtValue)) {
                customersWithDebt = customersWithDebt.filter(customer => customer.totalDebt >= debtValue);
            }
        }

        res.json(customersWithDebt);
    } catch (error) {
        console.error('Erro ao buscar clientes no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
    }
};

// @desc    Obter um cliente por ID
// @route   GET /api/customers/:id
// @access  Private (Admin, Employee)
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar cliente por ID no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar cliente por ID', error: error.message });
    }
};

// @desc    Criar um novo cliente
// @route   POST /api/customers
// @access  Private (Admin, Employee)
const createCustomer = async (req, res) => {
    const { name, email, phone, address } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Nome do cliente é obrigatório' });
    }

    try {
        const customer = new Customer({ name, email, phone, address });
        // totalDebt sera 0 por default no schema Customer
        const createdCustomer = await customer.save();
        res.status(201).json(createdCustomer);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um cliente com este nome.' });
        }
        console.error('Erro ao criar cliente no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
    }
};

// @desc    Atualizar um cliente
// @route   PUT /api/customers/:id
// @access  Private (Admin, Employee)
const updateCustomer = async (req, res) => {
    const { name, email, phone, address } = req.body; // totalDebt não é atualizado diretamente por aqui

    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            customer.name = name || customer.name;
            customer.email = email !== undefined ? email : customer.email;
            customer.phone = phone !== undefined ? phone : customer.phone;
            customer.address = address !== undefined ? address : customer.address;
            // totalDebt nao eh atualizado diretamente por esta rota, eh calculado

            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe outro cliente com este nome.' });
        }
        console.error('Erro ao atualizar cliente no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
    }
};

// @desc    Deletar um cliente
// @route   DELETE /api/customers/:id
// @access  Private (Admin apenas)
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);

        if (customer) {
            // Opcional: Deletar pedidos e dívidas associados (para evitar órfãos)
            await Order.deleteMany({ customer: customer._id });
            await Debt.deleteMany({ customer: customer._id });
            await Payment.deleteMany({ customer: customer._id });

            res.json({ message: 'Cliente removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao deletar cliente no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
    }
};

module.exports = {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
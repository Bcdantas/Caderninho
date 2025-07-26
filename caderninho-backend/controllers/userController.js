const User = require('../models/User'); // Importa o modelo de Usuário
const jwt = require('jsonwebtoken');     // Para tokens JWT
const bcrypt = require('bcryptjs');      // Para criptografia de senha

// Função auxiliar para gerar o token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // O token expira em 1 hora
    });
};

// @desc    Registrar um novo usuário (usado inicialmente para criar o admin)
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => { // Alterado para exports.registerUser
    const { username, password, role } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    try {
        const user = await User.create({ username, password, role });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    }
};

// @desc    Autenticar um usuário e obter um token (login)
// @route   POST /api/users/login
// @access  Public
exports.authUser = async (req, res) => { // Alterado para exports.authUser
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Nome de usuário ou senha inválidos' });
    }
};

// @desc    Obter todos os usuários (clientes)
// @route   GET /api/users/customers
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' })
                                .select('-password')
                                .populate({
                                    path: 'orders', // Popula o virtual 'orders'
                                    select: 'totalAmount isPaid' // Seleciona apenas o totalAmount e isPaid dos pedidos
                                });

        // Mapeia os usuários para adicionar o totalDebt calculado
        const usersWithDebt = users.map(user => ({
            _id: user._id,
            username: user.username,
            phone: user.phone, // Assumindo que phone está no User schema
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            totalDebt: user.calculateTotalDebt() // Calcula a dívida usando o método
        }));

        res.json(usersWithDebt);
    } catch (err) {
        console.error('Erro ao buscar usuários/clientes:', err);
        res.status(500).json({ message: 'Erro ao buscar usuários/clientes', error: err.message });
    }
};
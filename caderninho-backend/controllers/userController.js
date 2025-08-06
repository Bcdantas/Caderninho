// CAMINHO: caderninho-backend/controllers/userController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Registrar um novo usuário
// @route   POST /api/users/register
exports.registerUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }
        const user = await User.create({ username, password, role });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
            establishmentName: process.env.ESTABLISHMENT_NAME || 'Caderninho'
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    }
};

// @desc    Autenticar um usuário e obter um token (login)
// @route   POST /api/users/login
exports.authUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
                establishmentName: process.env.ESTABLISHMENT_NAME || 'Caderninho'
            });
        } else {
            res.status(401).json({ message: 'Nome de usuário ou senha inválidos' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor durante o login' });
    }
};
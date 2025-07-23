const express = require('express');
const router = express.Router(); // Cria um roteador para organizar as rotas
const User = require('../models/User'); // Importa o modelo de Usuário que criamos
const jwt = require('jsonwebtoken'); // Para criar tokens de autenticação
const bcrypt = require('bcryptjs'); // Para comparar senhas criptografadas

// Função auxiliar para gerar o token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // O token expira em 1 hora
    });
};

// @desc    Registrar um novo usuário (usado inicialmente para criar o admin)
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body; // Pega o nome de usuário, senha e função do corpo da requisição

    // Verifica se o usuário já existe
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    try {
        // Cria um novo usuário usando o modelo
        const user = await User.create({ username, password, role });

        // Responde com o usuário criado (sem a senha) e um token JWT
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id), // Gera e envia um token para o usuário logar automaticamente
        });
    } catch (error) {
        // Em caso de erro ao salvar, retorna uma mensagem de erro
        res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
    }
});

// @desc    Autenticar um usuário e obter um token (login)
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Pega o nome de usuário e senha do corpo da requisição

    // Encontra o usuário pelo nome
    const user = await User.findOne({ username });

    // Verifica se o usuário existe e se a senha está correta
    if (user && (await user.matchPassword(password))) {
        // Se sim, responde com os dados do usuário e um novo token
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id), // Gera e envia o token de autenticação
        });
    } else {
        // Se não, retorna erro de credenciais inválidas
        res.status(401).json({ message: 'Nome de usuário ou senha inválidos' });
    }
});

module.exports = router; // Exporta o roteador para ser usado no arquivo principal do servidor
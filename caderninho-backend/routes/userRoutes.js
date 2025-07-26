const express = require('express');
const router = express.Router();
// Importa as funções do controller
const { registerUser, authUser, getAllUsers } = require('../controllers/userController');
// Importa o middleware de proteção
const { protect } = require('../middleware/authMiddleware');

// Rotas públicas
router.post('/register', registerUser); // Chama a função registerUser do controller
router.post('/login', authUser);       // Chama a função authUser do controller

// Rotas protegidas
router.get('/customers', protect, getAllUsers); // Rota para listar clientes (usuários com role 'customer')

module.exports = router;
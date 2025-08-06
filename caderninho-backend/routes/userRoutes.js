// CAMINHO: caderninho-backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { authUser, registerUser } = require('../controllers/userController');

router.post('/login', authUser);
router.post('/register', registerUser);

// Rota pública para obter o nome do estabelecimento
router.get('/establishment-name', (req, res) => {
    res.json({ establishmentName: process.env.ESTABLISHMENT_NAME || 'Caderninho' });
});

module.exports = router;
// CAMINHO: caderninho-backend/routes/expenseRoutes.js

const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// @desc    Obter todas as despesas
// @route   GET /api/expenses
// @access  Private (Admin)
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const expenses = await Expense.find({}).sort({ expenseDate: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar despesas.' });
    }
});

// @desc    Criar uma nova despesa
// @route   POST /api/expenses
// @access  Private (Admin)
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
    const { amount, description } = req.body;

    if (!amount || !description) {
        return res.status(400).json({ message: 'Valor e observação são obrigatórios.' });
    }

    try {
        const expense = new Expense({
            amount,
            description,
            user: req.user._id // Associa a despesa ao usuário logado
        });

        const createdExpense = await expense.save();
        res.status(201).json(createdExpense);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar despesa.' });
    }
});

// Futuramente, podemos adicionar rotas para editar e deletar despesas aqui.

module.exports = router;
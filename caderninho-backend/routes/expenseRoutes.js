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
        const expenses = await Expense.find({}).sort({ createdAt: -1 });
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
            user: req.user._id
        });

        const createdExpense = await expense.save();
        res.status(201).json(createdExpense);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar despesa.' });
    }
});

// @desc    Atualizar (Editar) uma despesa
// @route   PUT /api/expenses/:id
// @access  Private (Admin)
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    const { amount, description } = req.body;

    try {
        const expense = await Expense.findById(req.params.id);

        if (expense) {
            expense.amount = amount || expense.amount;
            expense.description = description || expense.description;
            
            const updatedExpense = await expense.save();
            res.json(updatedExpense);
        } else {
            res.status(404).json({ message: 'Despesa não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar despesa.' });
    }
});

// @desc    Excluir uma despesa
// @route   DELETE /api/expenses/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (expense) {
            res.json({ message: 'Despesa removida com sucesso.' });
        } else {
            res.status(404).json({ message: 'Despesa não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir despesa.' });
    }
});

module.exports = router;
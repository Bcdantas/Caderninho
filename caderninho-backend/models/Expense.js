// CAMINHO: caderninho-backend/models/Expense.js

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'O valor da despesa é obrigatório.'],
    },
    description: {
        type: String,
        required: [true, 'A observação da despesa é obrigatória.'],
        trim: true,
    },
    expenseDate: {
        type: Date,
        default: Date.now,
    },
    // Adiciona uma referência a quem registrou a despesa (opcional, mas bom para o futuro)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
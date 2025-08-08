// CAMINHO: caderninho-backend/models/Caixa.js

const mongoose = require('mongoose');

const caixaSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: () => new Date().setHours(0, 0, 0, 0), // Garante que a data seja o início do dia
        unique: true
    },
    initialBalance: {
        type: Number,
        required: true
    },
    transactions: [
        {
            type: {
                type: String,
                enum: ['inflow', 'outflow'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            relatedOrder: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            },
        },
    ],
    isClosed: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

const Caixa = mongoose.model('Caixa', caixaSchema);
module.exports = Caixa;
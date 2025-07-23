const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Referencia o cliente que tem a dívida
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Referencia o pedido que originou a dívida
        required: true,
        unique: true // Um pedido só pode gerar uma dívida
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    // Adicionando um campo para a data de criação da dívida, que pode ser útil
    debtDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Debt', debtSchema);
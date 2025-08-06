// CAMINHO: caderninho-backend/models/Payment.js

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
}, {
    timestamps: true // Usa o 'createdAt' automático como data oficial do pagamento
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
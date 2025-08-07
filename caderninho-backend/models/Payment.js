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
        required: false, // <<< MUDANÇA: Um pagamento não precisa mais estar ligado a um pedido
        ref: 'Order'
    },
    debt: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // <<< NOVO: Referência à dívida que está sendo paga
        ref: 'Debt'
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
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
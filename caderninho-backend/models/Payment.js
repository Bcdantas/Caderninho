const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        customer: { // Quem fez o pagamento
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Customer',
        },
        order: { // Qual pedido foi pago (pode ser nulo se for um pagamento "genérico")
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Pedido é opcional para pagamentos que não vêm de um pedido específico
            ref: 'Order',
        },
        amount: { // Valor efetivamente recebido neste pagamento
            type: Number,
            required: true,
        },
        paymentMethod: { // Método de pagamento (Dinheiro, Cartão, Outro)
            type: String,
            required: true,
            enum: ['Dinheiro', 'Cartão', 'Outro'],
        },
        paymentDate: { // Data e hora do registro do pagamento
            type: Date,
            required: true,
            default: Date.now,
        },
        // Você pode adicionar mais campos aqui no futuro, se precisar de mais detalhes de pagamento
        // Por exemplo: troco, transacao_id do cartão, etc.
    },
    {
        timestamps: true, // Adiciona createdAt e updatedAt
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
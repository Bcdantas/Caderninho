const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Referencia o modelo Product
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1, // Quantidade mínima de 1
        default: 1
    },
    priceAtOrder: { // Preço do produto no momento do pedido (para histórico)
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Referencia o modelo Customer
        required: true
    },
    items: [orderItemSchema], // Array de produtos no pedido
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false // O pedido começa como não pago (uma dívida)
    }
}, {
    timestamps: true
});

// Pré-salvamento: Calcula o total do pedido antes de salvar
orderSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((acc, item) => acc + (item.quantity * item.priceAtOrder), 0);
    next();
});

module.exports = mongoose.model('Order', orderSchema);
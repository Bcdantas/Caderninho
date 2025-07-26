const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Cada cliente terá um nome único
        trim: true
    },
    phone: {
        type: String,
        required: false, // Telefone é opcional
        trim: true
    }
}, {
    timestamps: true
});

customerSchema.virtual('orders', { // <<-- NOVO VIRTUAL!
    ref: 'Order',
    localField: '_id',
    foreignField: 'customer',
    justOne: false,
});

// Função que calcula o total da dívida a partir dos pedidos não pagos
customerSchema.methods.calculateTotalDebt = function() { // <<-- NOVO MÉTODO!
    if (!this.orders) {
        return 0; // Se orders não foi populado, ou se não há pedidos
    }
    const unpaidOrders = this.orders.filter(order => !order.isPaid);
    const total = unpaidOrders.reduce((sum, order) => sum + order.totalAmount, 0); // Use totalAmount aqui
    return total;
};

// Garante que os virtuais e métodos sejam incluídos ao converter para JSON
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });


module.exports = mongoose.model('Customer', customerSchema);
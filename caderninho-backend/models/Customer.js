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

// Campo virtual para calcular o total da dívida.
// Isso NÃO é armazenado no banco, mas calculado quando solicitado.
customerSchema.virtual('totalDebt', {
    ref: 'Debt', // Referencia o modelo Debt
    localField: '_id', // O campo que conecta é o _id do cliente
    foreignField: 'customer', // No modelo Debt, o campo 'customer' guarda o _id do cliente
    justOne: false, // Pode ter várias dívidas para o mesmo cliente
    options: { match: { isPaid: false } } // Filtra apenas as dívidas não pagas
});

// Certifique-se de que os campos virtuais sejam incluídos nas respostas JSON
customerSchema.set('toObject', { virtuals: true });
customerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
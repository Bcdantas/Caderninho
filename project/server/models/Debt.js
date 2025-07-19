const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', // Referencia o modelo de Cliente
    required: true,
    unique: true, // Garante que cada cliente tenha apenas uma entrada de dívida
  },
  totalDebt: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  // Opcional: Você pode querer armazenar uma lista de IDs de pedidos pendentes aqui
  // pendingOrders: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Order',
  // }],
});

module.exports = mongoose.model('Debt', debtSchema);
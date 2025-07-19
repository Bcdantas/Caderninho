const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId, // <-- ESTE É CRÍTICO
    ref: 'Customer', // <-- E ESTE
    required: false, // Pode ser null se a venda não tiver cliente associado
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId, // <-- ESTE É CRÍTICO
        ref: 'Product', // <-- E ESTE
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Order', orderSchema);
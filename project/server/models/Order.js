const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
}, {_id: false});


const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
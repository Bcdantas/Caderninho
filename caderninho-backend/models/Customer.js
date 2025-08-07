// CAMINHO: caderninho-backend/models/Customer.js

const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    phone: { type: String },
    // Este campo é essencial para a nova lógica!
    debt: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
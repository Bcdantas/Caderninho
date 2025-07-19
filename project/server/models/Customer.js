const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hasDebt: { type: Boolean, default: false },
});

module.exports = mongoose.model('Customer', CustomerSchema);
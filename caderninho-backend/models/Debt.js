// CAMINHO: caderninho-backend/models/Debt.js

const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true, // <<< VOLTOU A SER OBRIGATÓRIO
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

debtSchema.pre('save', function(next) {
    if (this.isNew) {
        this.remainingAmount = this.amount;
    }
    next();
});

const Debt = mongoose.model('Debt', debtSchema);
module.exports = Debt;
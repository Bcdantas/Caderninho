const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Cada produto terá um nome único
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0 // Preço não pode ser negativo
    },
    description: {
        type: String,
        required: false // Descrição é opcional
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
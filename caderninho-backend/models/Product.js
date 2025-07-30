// CAMINHO: caderninho-backend/models/Product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, adicione um nome para o produto.'],
        trim: true,
        unique: true
    },
    price: {
        type: Number,
        required: [true, 'Por favor, adicione um preço para o produto.']
    },
    description: {
        type: String,
        trim: true
    },
    // =======================================================
    // ## CAMPO DE ESTOQUE ADICIONADO AQUI ##
    quantityInStock: {
        type: Number,
        required: true,
        default: 0 // Todo novo produto começa com 0 em estoque.
    }
    // =======================================================
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
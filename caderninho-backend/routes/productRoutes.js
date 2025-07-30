// CAMINHO: caderninho-backend/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Rota GET (sem alteração)
router.get('/', protect, authorizeRoles('admin', 'employee'), async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
});

// @desc    Criar um novo produto
// @route   POST /api/products
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
    // Adiciona quantityInStock aos dados recebidos
    const { name, price, description, quantityInStock } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
    }

    try {
        const product = new Product({
            name,
            price,
            description,
            quantityInStock: quantityInStock || 0 // Usa o valor enviado ou 0 como padrão
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um produto com este nome.' });
        }
        res.status(500).json({ message: 'Erro ao criar produto' });
    }
});

// @desc    Atualizar um produto
// @route   PUT /api/products/:id
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    const { name, price, description, quantityInStock } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.price = price !== undefined ? price : product.price;
            product.description = description !== undefined ? description : product.description;
            // Permite atualizar a quantidade em estoque
            product.quantityInStock = quantityInStock !== undefined ? quantityInStock : product.quantityInStock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe outro produto com este nome.' });
        }
        res.status(500).json({ message: 'Erro ao atualizar produto' });
    }
});

// Rota DELETE (sem alteração)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (product) {
            res.json({ message: 'Produto removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar produto' });
    }
});

module.exports = router;
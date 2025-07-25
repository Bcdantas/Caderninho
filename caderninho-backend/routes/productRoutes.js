const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Importa o modelo de Produto

// Middleware de proteção de rota (autenticação) - AINDA NÃO TEMOS, MAS VAMOS ADICIONAR
// const { protect } = require('../middleware/authMiddleware');

// @desc    Obter todos os produtos
// @route   GET /api/products
// @access  Public (por enquanto, depois pode ser Protected)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}); // Encontra todos os produtos no DB
        res.json(products); // Retorna os produtos como JSON
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
});

// @desc    Obter um produto por ID
// @route   GET /api/products/:id
// @access  Public (por enquanto)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Busca um produto pelo ID
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
    }
});

// @desc    Criar um novo produto
// @route   POST /api/products
// @access  Private (futuramente, só admin pode criar)
router.post('/', async (req, res) => { // Removido o 'protect' temporariamente
    const { name, price, description } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
    }

    try {
        const product = new Product({ name, price, description });
        const createdProduct = await product.save(); // Salva o novo produto no DB
        res.status(201).json(createdProduct); // Retorna o produto criado
    } catch (error) {
        // Se o nome do produto já existe (devido ao 'unique: true' no schema)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um produto com este nome.' });
        }
        res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
    }
});

// @desc    Atualizar um produto
// @route   PUT /api/products/:id
// @access  Private (futuramente)
router.put('/:id', async (req, res) => { // Removido o 'protect' temporariamente
    const { name, price, description } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name; // Atualiza o nome se for fornecido
            product.price = price || product.price; // Atualiza o preço se for fornecido
            product.description = description !== undefined ? description : product.description; // Atualiza a descrição

            const updatedProduct = await product.save(); // Salva as alterações
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        // Se o novo nome do produto já existe
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe outro produto com este nome.' });
        }
        res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
    }
});

// @desc    Deletar um produto
// @route   DELETE /api/products/:id
// @access  Private (futuramente)
router.delete('/:id', async (req, res) => { // Removido o 'protect' temporariamente
    try {
        const product = await Product.findByIdAndDelete(req.params.id); // Encontra e deleta pelo ID

        if (product) {
            res.json({ message: 'Produto removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
    }
});

module.exports = router;
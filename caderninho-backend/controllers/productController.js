// CAMINHO: caderninho-backend/controllers/productController.js

const Product = require('../models/Product');

const getProducts = async (req, res) => {
    const { name, minPrice, maxPrice, description } = req.query;
    const filter = {};

    if (name) {
        filter.name = { $regex: name, $options: 'i' };
    }

    if (description) {
        filter.description = { $regex: description, $options: 'i' };
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) {
            filter.price.$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
            filter.price.$lte = parseFloat(maxPrice);
        }
    }

    try {
        const products = await Product.find(filter).sort({ name: 1 });
        res.json(products);
    } catch (error) {
        console.error('Erro ao buscar produtos no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar produto por ID no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar produto por ID', error: error.message });
    }
};

const createProduct = async (req, res) => {
    const { name, price, description } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
    }

    try {
        const product = new Product({ name, price, description });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um produto com este nome.' });
        }
        console.error('Erro ao criar produto no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    const { name, price, description } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description !== undefined ? description : product.description;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe outro produto com este nome.' });
        }
        console.error('Erro ao atualizar produto no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (product) {
            res.json({ message: 'Produto removido com sucesso' });
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao deletar produto no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
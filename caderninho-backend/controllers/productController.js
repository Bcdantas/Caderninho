const Product = require('../models/Product'); // Importa o modelo de Produto

// @desc    Obter todos os produtos (com pesquisa)
// @route   GET /api/products
// @access  Private (Admin, Employee)
const getProducts = async (req, res) => {
    const { name, minPrice, maxPrice, description } = req.query; // Pega os parâmetros da URL
    const filter = {}; // Objeto para construir o filtro do MongoDB

    // Filtrar por nome (busca parcial e case-insensitive)
    if (name) {
        filter.name = { $regex: name, $options: 'i' }; // $regex para busca parcial, 'i' para ignorar maiúsculas/minúsculas
    }

    // Filtrar por descrição (busca parcial e case-insensitive)
    if (description) {
        filter.description = { $regex: description, $options: 'i' };
    }

    // Filtrar por preço (intervalo)
    if (minPrice || maxPrice) {
        filter.price = {}; // Cria um sub-objeto para o filtro de preço
        if (minPrice) {
            filter.price.$gte = parseFloat(minPrice); // $gte: maior ou igual a
        }
        if (maxPrice) {
            filter.price.$lte = parseFloat(maxPrice); // $lte: menor ou igual a
        }
    }

    try {
        const products = await Product.find(filter).sort({ name: 1 }); // Aplica os filtros e ordena por nome
        res.json(products);
    } catch (error) {
        console.error('Erro ao buscar produtos no controller:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
};

// @desc    Obter um produto por ID
// @route   GET /api/products/:id
// @access  Private (Admin, Employee)
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

// @desc    Criar um novo produto
// @route   POST /api/products
// @access  Private (Admin, Employee)
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

// @desc    Atualizar um produto
// @route   PUT /api/products/:id
// @access  Private (Admin, Employee)
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

// @desc    Deletar um produto
// @route   DELETE /api/products/:id
// @access  Private (Admin apenas)
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
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Rota para obter todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("ERRO CRÍTICO NA ROTA GET /api/products:", err.message); // Log detalhado
    console.error(err.stack); // Mostra a pilha de chamadas para depuração
    res.status(500).json({ message: "Erro interno do servidor ao buscar produtos." });
  }
});

// Rota para adicionar um novo produto
router.post('/', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
  });
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("ERRO ao adicionar produto (POST /api/products):", err.message);
    console.error(err.stack);
    res.status(400).json({ message: err.message });
  }
});

// Rota para atualizar um produto
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error("ERRO ao atualizar produto (PUT /api/products/:id):", err.message);
    console.error(err.stack);
    res.status(400).json({ message: err.message });
  }
});

// Rota para deletar um produto
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    console.error("ERRO ao deletar produto (DELETE /api/products/:id):", err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Rota para obter todos os clientes
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    console.error("ERRO CRÍTICO NA ROTA GET /api/customers:", err.message); // Log detalhado
    console.error(err.stack); // Mostra a pilha de chamadas para depuração
    res.status(500).json({ message: "Erro interno do servidor ao buscar clientes." });
  }
});

// Rota para adicionar um novo cliente
router.post('/', async (req, res) => {
  const customer = new Customer({
    name: req.body.name,
  });
  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("ERRO ao adicionar cliente (POST /api/customers):", err.message);
    console.error(err.stack);
    res.status(400).json({ message: err.message });
  }
});

// Rota para atualizar um cliente
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    customer.name = req.body.name || customer.name;
    customer.hasDebt = req.body.hasDebt !== undefined ? req.body.hasDebt : customer.hasDebt;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    console.error("ERRO ao atualizar cliente (PUT /api/customers/:id):", err.message);
    console.error(err.stack);
    res.status(400).json({ message: err.message });
  }
});

// Rota para deletar um cliente
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    await Customer.deleteOne({ _id: req.params.id });
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err) {
    console.error("ERRO ao deletar cliente (DELETE /api/customers/:id):", err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
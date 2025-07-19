const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // Para calcular o total
const Customer = require('../models/Customer'); // Para atualizar hasDebt

// Helper para calcular o total do pedido
async function calculateOrderTotal(items) {
  let total = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      total += product.price * item.quantity;
    }
  }
  return total;
}

// Helper para atualizar o status de dívida do cliente
async function updateCustomerDebtStatus(customerId) {
  if (!customerId) return;
  try {
    const customerOrders = await Order.find({ customerId: customerId, isPaid: false });
    const hasUnpaidOrders = customerOrders.length > 0;

    const customer = await Customer.findById(customerId);
    if (customer && customer.hasDebt !== hasUnpaidOrders) {
      customer.hasDebt = hasUnpaidOrders;
      await customer.save();
      console.log(`Status de dívida do cliente ${customer.name} (${customer._id}) atualizado para: ${hasUnpaidOrders}`);
    }
  } catch (error) {
    console.error(`Erro ao atualizar status de dívida para o cliente ${customerId}:`, error);
  }
}

// Rota para obter todos os pedidos (popula cliente e produtos para facilitar o frontend)
router.get('/', async (req, res) => {
  try {
    // ESTA LINHA É A MAIS IMPORTANTE AQUI: GARANTA QUE ESTÁ POPULANDO CORRETAMENTE
    const orders = await Order.find().populate('customerId').populate('items.productId'); 
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para adicionar um novo pedido
router.post('/', async (req, res) => {
  const { customerId, items, isPaid } = req.body;
  
  try {
    const total = await calculateOrderTotal(items);
    
    const order = new Order({
      customerId: customerId || null,
      items,
      total,
      isPaid: isPaid || false,
    });

    const newOrder = await order.save();
    if (customerId) {
      await updateCustomerDebtStatus(customerId); 
    }

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para atualizar um pedido
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    const oldCustomerId = order.customerId ? order.customerId.toString() : null;
    
    order.customerId = req.body.customerId !== undefined ? req.body.customerId : order.customerId;
    order.items = req.body.items || order.items;
    order.isPaid = req.body.isPaid !== undefined ? req.body.isPaid : order.isPaid;
    
    if (req.body.items) {
      order.total = await calculateOrderTotal(order.items);
    }

    const updatedOrder = await order.save();
    
    if (oldCustomerId && oldCustomerId !== updatedOrder.customerId?.toString()) {
      await updateCustomerDebtStatus(oldCustomerId);
    }
    if (updatedOrder.customerId) {
      await updateCustomerDebtStatus(updatedOrder.customerId);
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para deletar um pedido
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    const customerId = order.customerId; 
    
    await Order.deleteOne({ _id: req.params.id }); 
    
    if (customerId) {
      await updateCustomerDebtStatus(customerId); 
    }

    res.json({ message: 'Pedido excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para marcar um pedido como pago
router.patch('/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    order.isPaid = true;
    const updatedOrder = await order.save();
    
    if (order.customerId) {
      await updateCustomerDebtStatus(order.customerId); 
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
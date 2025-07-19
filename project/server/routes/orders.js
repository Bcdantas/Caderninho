const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Importar a função de recálculo da dívida da nova rota de dívidas
const { recalculateCustomerTotalDebt } = require('./debts');

// Helper para calcular o total do pedido (NO BACKEND)
async function calculateOrderTotal(items) {
  let total = 0;
  for (const item of items) {
    // Tenta encontrar o produto pelo ID. É CRÍTICO que productId seja um ID VÁLIDO.
    const product = await Product.findById(item.productId);
    if (product) {
      total += product.price * item.quantity;
    } else {
      console.warn(`Produto com ID ${item.productId} não encontrado ao calcular total do pedido.`);
    }
  }
  return total;
}

// Rota para obter todos os pedidos (popula cliente e produtos para facilitar o frontend)
router.get('/', async (req, res) => {
  console.log("\n--- INICIANDO REQUISIÇÃO GET /api/orders ---");
  try {
    const finalOrders = await Order.find()
                               .populate('customerId')
                               .populate('items.productId');

    console.log("--- PEDIDOS FINAIS ENVIADOS AO FRONTEND (com populamento completo) ---");
    console.log(JSON.stringify(finalOrders, null, 2));
    console.log("--- FIM DOS PEDIDOS ---");

    res.json(finalOrders);

  } catch (err) {
    console.error("### ERRO CRÍTICO NA ROTA GET /api/orders (durante populamento ou busca) ###");
    console.error("Mensagem do Erro:", err.message);
    console.error("Nome do Erro:", err.name);
    console.error("Detalhes do Erro:", err);
    console.error("Pilha de Chamadas (Stack):", err.stack);
    console.error("### FIM DO ERRO ###");
    res.status(500).json({ message: "Erro interno do servidor ao buscar pedidos." });
  }
  console.log("--- FINALIZANDO REQUISIÇÃO GET /api/orders ---\n");
});

// Rota para adicionar um novo pedido
router.post('/', async (req, res) => {
  const { customerId, items, isPaid } = req.body;

  try {
    const total = await calculateOrderTotal(items);

    const order = new Order({ // LINHA DE DECLARAÇÃO
      customerId: customerId || null,
      items,
      total,
      isPaid: isPaid || false,
    });

    const newOrder = await order.save();

    if (customerId) {
      await recalculateCustomerTotalDebt(customerId);
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("ERRO ao adicionar pedido (POST /api/orders):", err.message);
    console.error(err.stack);
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
      await recalculateCustomerTotalDebt(oldCustomerId);
    }
    if (updatedOrder.customerId) {
      await recalculateCustomerTotalDebt(updatedOrder.customerId);
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error("ERRO ao atualizar pedido (PUT /api/orders/:id):", err.message);
    console.error(err.stack);
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
      await recalculateCustomerTotalDebt(customerId); 
    }

    res.json({ message: 'Pedido excluído com sucesso' });
  } catch (err) {
    console.error("ERRO ao deletar pedido (DELETE /api/orders/:id):", err.message);
    console.error(err.stack);
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
      await recalculateCustomerTotalDebt(order.customerId); 
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error("ERRO ao marcar pedido como pago (PATCH /api/orders/:id/pay):", err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
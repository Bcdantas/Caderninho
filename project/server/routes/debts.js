const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');
const Order = require('../models/Order'); // Para calcular a dívida real
const Product = require('../models/Product'); // Para calcular a dívida real (preços)

// Helper para recalcular a dívida total de um cliente
async function recalculateCustomerTotalDebt(customerId) {
  try {
    const pendingOrders = await Order.find({ customerId: customerId, isPaid: false });
    let newTotalDebt = 0;

    for (const order of pendingOrders) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          newTotalDebt += product.price * item.quantity;
        } else {
          console.warn(`[recalculateCustomerTotalDebt] Produto com ID ${item.productId} não encontrado para o pedido ${order._id}.`);
        }
      }
    }

    // Encontra ou cria a entrada de dívida para o cliente
    let debtEntry = await Debt.findOne({ customerId: customerId });

    if (debtEntry) {
      // Atualiza a dívida existente
      if (debtEntry.totalDebt !== newTotalDebt) {
        debtEntry.totalDebt = newTotalDebt;
        await debtEntry.save();
        console.log(`Dívida do cliente ${customerId} atualizada para R$ ${newTotalDebt.toFixed(2)}.`);
      }
    } else if (newTotalDebt > 0) {
      // Cria uma nova entrada de dívida se o cliente tiver dívida e não tiver uma entrada
      debtEntry = new Debt({
        customerId: customerId,
        totalDebt: newTotalDebt,
      });
      await debtEntry.save();
      console.log(`Nova dívida criada para o cliente ${customerId}: R$ ${newTotalDebt.toFixed(2)}.`);
    } else {
        // Se a dívida for 0 e não houver entrada, não faz nada
        // Se a dívida for 0 e houver entrada (e estava pendente), isso será tratado no updateCustomerDebtStatus no orders.js
    }
    return newTotalDebt;

  } catch (error) {
    console.error(`ERRO ao recalcular dívida para o cliente ${customerId}:`, error);
    console.error(error.stack);
    return null;
  }
}


// Rota para obter todas as dívidas pendentes
router.get('/', async (req, res) => {
  try {
    const debts = await Debt.find({ totalDebt: { $gt: 0 } }).populate('customerId'); // Popula o cliente associado
    res.json(debts);
  } catch (err) {
    console.error("ERRO na rota GET /api/debts:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Erro interno do servidor ao buscar dívidas." });
  }
});

// Rota para obter a dívida de um cliente específico
router.get('/:customerId', async (req, res) => {
  try {
    const debt = await Debt.findOne({ customerId: req.params.customerId }).populate('customerId');
    if (!debt) {
      return res.status(404).json({ message: 'Dívida para este cliente não encontrada.' });
    }
    res.json(debt);
  } catch (err) {
    console.error("ERRO na rota GET /api/debts/:customerId:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Erro interno do servidor ao buscar dívida do cliente." });
  }
});

// Não teremos POST/PUT/DELETE diretos para dívidas, elas serão gerenciadas por outras rotas (pedidos)
// No entanto, para fins de depuração, podemos ter uma rota para forçar o recálculo
router.post('/recalculate/:customerId', async (req, res) => {
  try {
    const totalDebt = await recalculateCustomerTotalDebt(req.params.customerId);
    if (totalDebt === null) {
        return res.status(500).json({ message: "Falha ao recalcular dívida." });
    }
    res.json({ message: "Dívida recalculada com sucesso.", totalDebt });
  } catch (error) {
    console.error("ERRO na rota POST /api/debts/recalculate:", error.message);
    res.status(500).json({ message: "Erro interno ao recalcular dívida." });
  }
});


// ... (todo o resto do debts.js) ...

module.exports = router;
module.exports.recalculateCustomerTotalDebt = recalculateCustomerTotalDebt;
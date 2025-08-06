// CAMINHO: caderninho-backend/controllers/paymentController.js

const Payment = require('../models/Payment');

// @desc    Obter todos os pagamentos com filtros avançados e paginação
// @route   GET /api/payments
// @access  Private (Admin only)
exports.getPayments = async (req, res) => {
  try {
    // --- Lógica de Paginação ---
    const pageSize = 15; // Quantidade de itens por página
    const page = Number(req.query.page) || 1; // Pega a página da URL ou usa 1 como padrão

    // --- Lógica de Filtros Dinâmicos ---
    const { customerId, paymentMethod, startDate, endDate, minAmount, maxAmount } = req.query;
    let filter = {};

    // Filtro por Cliente
    if (customerId) {
      filter.customer = customerId;
    }

    // Filtro por Método de Pagamento
    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
    }

    // Filtro por Data (dia, mês, ano)
    if (startDate || endDate) {
      filter.createdAt = {}; // Padronizado para createdAt
      if (startDate) {
        // Garante que a data de início comece à meia-noite
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Garante que pegue o dia inteiro
        filter.createdAt.$lte = end;
      }
    }

    // Filtro por Valor (range)
    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) {
            filter.amount.$gte = Number(minAmount); // $gte = Greater than or equal (maior ou igual)
        }
        if (maxAmount) {
            filter.amount.$lte = Number(maxAmount); // $lte = Less than or equal (menor ou igual)
        }
    }

    // --- Execução das Queries ---
    // 1. Contar o total de documentos que correspondem ao filtro
    const count = await Payment.countDocuments(filter);
    
    // 2. Buscar os pagamentos aplicando o filtro e a paginação
    const payments = await Payment.find(filter)
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // 3. Enviar a resposta no formato de paginação que o frontend espera
    res.status(200).json({
      payments,
      page,
      pages: Math.ceil(count / pageSize)
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de pagamentos', error: error.message });
  }
};
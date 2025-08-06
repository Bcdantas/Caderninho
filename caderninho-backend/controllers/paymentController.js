// CAMINHO: caderninho-backend/controllers/paymentController.js

const Payment = require('../models/Payment');

// @desc    Obter todos os pagamentos com filtros e paginação
// @route   GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const pageSize = 15;
    const page = Number(req.query.page) || 1;
    const { customerId, startDate, endDate } = req.query;
    let filter = {};

    if (customerId) {
      filter.customer = customerId;
    }
    
    // Filtro de data padronizado para usar 'createdAt'
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const count = await Payment.countDocuments(filter);
    
    const payments = await Payment.find(filter)
      .populate('customer', 'name')
      .populate('order', 'totalAmount')
      .sort({ createdAt: -1 }) // Ordena por 'createdAt'
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      payments,
      page,
      pages: Math.ceil(count / pageSize)
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar histórico de pagamentos', error: error.message });
  }
};
// CAMINHO: caderninho-backend/controllers/paymentController.js

const Payment = require('../models/Payment');

exports.getPayments = async (req, res) => {
  try {
    const pageSize = 15;
    const page = Number(req.query.page) || 1;

    const { customerId, paymentMethod, startDate, endDate, minAmount, maxAmount } = req.query;
    let filter = {};

    if (customerId) {
      filter.customer = customerId;
    }

    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) {
            filter.amount.$gte = Number(minAmount);
        }
        if (maxAmount) {
            filter.amount.$lte = Number(maxAmount);
        }
    }

    const count = await Payment.countDocuments(filter);
    
    const payments = await Payment.find(filter)
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

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
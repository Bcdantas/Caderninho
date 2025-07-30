const Payment = require('../models/Payment');
const Customer = require('../models/Customer'); // Para popular o nome do cliente
const Order = require('../models/Order'); // Para popular detalhes do pedido, se necessário

// @desc    Get all payments with filters
// @route   GET /api/payments
// @access  Private (Admin only)
exports.getPayments = async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;
    let filter = {};

    // Filtrar por cliente
    if (customerId) {
      filter.customer = customerId;
    }

    // Filtrar por data
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) {
        filter.paymentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        // Para incluir o dia inteiro do endDate, adicionamos 23:59:59.999
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.paymentDate.$lte = end;
      }
    }

    const payments = await Payment.find(filter)
      .populate({
        path: 'customer',
        select: 'name email phone' // Seleciona apenas os campos necessários do cliente
      })
      .populate({
        path: 'order',
        select: 'totalAmount products' // Seleciona campos do pedido. Pode adicionar mais se precisar de detalhes do pedido na lista.
      })
      .sort({ paymentDate: -1 }); // Ordena do mais recente para o mais antigo

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de pagamentos', error: error.message });
  }
};
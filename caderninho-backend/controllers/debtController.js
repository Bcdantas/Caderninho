// CAMINHO: caderninho-backend/controllers/debtController.js

const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @desc    Obter um resumo de dívidas agrupadas por cliente
// @route   GET /api/debts/summary
const getDebtsSummary = async (req, res) => {
    try {
        const customersWithDebt = await Customer.find({ debt: { $gt: 0 } }).select('name debt');
        const debtsSummary = customersWithDebt.map(customer => ({
            customerId: customer._id,
            customerName: customer.name,
            totalDebt: customer.debt
        }));
        res.json(debtsSummary);
    } catch (error) {
        console.error("ERRO na rota /api/debts/summary:", error);
        res.status(500).json({ message: 'Erro ao buscar resumo de fiados.' });
    }
};

// @desc    Pagar uma parcela da dívida TOTAL de um cliente
// @route   POST /api/debts/customer/:customerId/pay
const payCustomerDebt = async (req, res) => {
    const { amountPaid, paymentMethod } = req.body;
    const { customerId } = req.params;

    if (!amountPaid || Number(amountPaid) <= 0) {
        return res.status(400).json({ message: 'O valor do pagamento é inválido.' });
    }

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        const newDebt = customer.debt - Number(amountPaid);
        customer.debt = newDebt > 0 ? newDebt : 0;
        
        await customer.save();

        const payment = new Payment({
            customer: customer._id,
            amount: Number(amountPaid),
            paymentMethod: paymentMethod || 'Dinheiro'
        });
        await payment.save();

        res.json({ message: 'Pagamento processado com sucesso.', newDebt: customer.debt });
    } catch (error) {
        console.error("ERRO na rota /api/debts/customer/:customerId/pay:", error);
        res.status(500).json({ message: 'Erro ao processar pagamento.' });
    }
};

// @desc    Processar pedidos expirados (lógica de "passou o dia")
// @route   POST /api/debts/process-expired
const processExpiredOrders = async (req, res) => {
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        console.log("------------------------------------------");
        console.log("DEBUG: Processamento de pedidos expirados");
        console.log("Data de corte (ontem):", yesterday);

        const expiredOrders = await Order.find({ 
            isPaid: false, 
            createdAt: { $lt: today, $lte: yesterday }
        });

        console.log("Pedidos encontrados para processamento:", expiredOrders);
        console.log("------------------------------------------");

        if (expiredOrders.length === 0) {
            return res.status(200).json({ message: 'Nenhum pedido expirado para processar.' });
        }

        const customerUpdates = new Map();

        for (const order of expiredOrders) {
            const customerId = order.customer.toString();
            const orderTotal = order.totalAmount;
            
            if (!customerUpdates.has(customerId)) {
                customerUpdates.set(customerId, 0);
            }
            customerUpdates.set(customerId, customerUpdates.get(customerId) + orderTotal);
        }

        const updatePromises = [];
        for (const [customerId, totalDebtToAdd] of customerUpdates.entries()) {
            updatePromises.push(
                Customer.findByIdAndUpdate(customerId, { $inc: { debt: totalDebtToAdd } })
            );
        }
        await Promise.all(updatePromises);

        const expiredOrderIds = expiredOrders.map(order => order._id);
        await Order.deleteMany({ _id: { $in: expiredOrderIds } });
        
        res.status(200).json({ message: `Processados ${expiredOrders.length} pedidos expirados.`, updatedCustomers: customerUpdates.size });

    } catch (error) {
        console.error("ERRO no processamento de pedidos expirados:", error);
        res.status(500).json({ message: 'Erro ao processar pedidos expirados.' });
    }
};

module.exports = {
    getDebtsSummary,
    payCustomerDebt,
    processExpiredOrders
};
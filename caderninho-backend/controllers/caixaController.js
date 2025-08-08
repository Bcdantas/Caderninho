// CAMINHO: caderninho-backend/controllers/caixaController.js

const Caixa = require('../models/Caixa');
const Order = require('../models/Order');

// @desc    Abre um novo caixa para o dia
// @route   POST /api/caixa/open
const openCaixa = async (req, res) => {
    const { initialBalance } = req.body;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const caixaExists = await Caixa.findOne({ date: today });
        if (caixaExists) {
            return res.status(400).json({ message: 'O caixa já está aberto para o dia de hoje.' });
        }

        if (initialBalance === undefined || initialBalance < 0) {
            return res.status(400).json({ message: 'Saldo inicial inválido.' });
        }

        const newCaixa = new Caixa({ initialBalance });
        const createdCaixa = await newCaixa.save();
        res.status(201).json(createdCaixa);
    } catch (error) {
        console.error("Erro ao abrir caixa:", error);
        res.status(500).json({ message: 'Erro ao abrir caixa.' });
    }
};

// @desc    Obtém o status do caixa para o dia atual
// @route   GET /api/caixa/status
const getCaixaStatus = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const caixa = await Caixa.findOne({ date: today });

        if (!caixa) {
            return res.status(200).json({ status: 'closed', initialBalance: 0, currentBalance: 0 });
        }

        const totalInflows = caixa.transactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0);
        const totalOutflows = caixa.transactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0);
        const currentBalance = caixa.initialBalance + totalInflows - totalOutflows;

        res.status(200).json({
            status: caixa.isClosed ? 'closed' : 'open',
            initialBalance: caixa.initialBalance,
            currentBalance: currentBalance,
            transactions: caixa.transactions,
            caixaId: caixa._id
        });
    } catch (error) {
        console.error("Erro ao obter status do caixa:", error);
        res.status(500).json({ message: 'Erro ao obter status do caixa.' });
    }
};

// @desc    Adiciona uma transação (entrada ou saída) no caixa
// @route   POST /api/caixa/transaction
const addTransaction = async (req, res) => {
    const { type, amount, description } = req.body;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const caixa = await Caixa.findOne({ date: today, isClosed: false });
        if (!caixa) {
            return res.status(400).json({ message: 'O caixa não está aberto para o dia de hoje.' });
        }

        if (!type || !amount || !description) {
            return res.status(400).json({ message: 'Tipo, valor e descrição da transação são obrigatórios.' });
        }
        
        caixa.transactions.push({ type, amount, description });
        const updatedCaixa = await caixa.save();
        
        res.status(200).json(updatedCaixa.transactions.slice(-1)[0]);
    } catch (error) {
        console.error("Erro ao adicionar transação no caixa:", error);
        res.status(500).json({ message: 'Erro ao adicionar transação no caixa.' });
    }
};

// @desc    Fecha o caixa do dia
// @route   POST /api/caixa/close
const closeCaixa = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const caixa = await Caixa.findOne({ date: today, isClosed: false });
        if (!caixa) {
            return res.status(400).json({ message: 'O caixa já está fechado ou não foi aberto hoje.' });
        }

        caixa.isClosed = true;
        await caixa.save();

        res.status(200).json({ message: 'Caixa fechado com sucesso.' });
    } catch (error) {
        console.error("Erro ao fechar caixa:", error);
        res.status(500).json({ message: 'Erro ao fechar caixa.' });
    }
};

module.exports = {
    openCaixa,
    getCaixaStatus,
    addTransaction,
    closeCaixa
};
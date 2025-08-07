// CAMINHO: caderninho-backend/routes/customerRoutes.js

const express = require('express');
const router = express.Router();
const { 
    getCustomers, 
    createCustomer, 
    getCustomerById,
    updateCustomer, 
    deleteCustomer 
} = require('../controllers/customerController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Rotas para a coleção de clientes (buscar todos e criar um novo)
router.route('/')
    .get(protect, authorizeRoles('admin', 'employee'), getCustomers)
    .post(protect, authorizeRoles('admin', 'employee'), createCustomer);

// Rotas para um cliente específico (buscar por ID, atualizar e deletar)
router.route('/:id')
    .get(protect, authorizeRoles('admin', 'employee'), getCustomerById)
    .put(protect, authorizeRoles('admin', 'employee'), updateCustomer)
    .delete(protect, authorizeRoles('admin'), deleteCustomer); // Apenas admin pode deletar

module.exports = router;
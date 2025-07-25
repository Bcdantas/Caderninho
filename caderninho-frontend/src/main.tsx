import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Importar as páginas que vamos criar
// import LoginPage from './pages/LoginPage.tsx'; // Login
// import ProductsPage from './pages/ProductsPage.tsx'; // Produtos
// import CustomersPage from './pages/CustomersPage.tsx'; // Clientes
// import OrdersPage from './pages/OrdersPage.tsx';     // Pedidos
// import DebtsPage from './pages/DebtsPage.tsx';       // Dívidas
// import DashboardPage from './pages/DashboardPage.tsx'; // Dashboard (página inicial após login)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Rota temporária para verificar o roteamento */}
        <Route path="/" element={<App />} />

        {/* Rotas futuras: */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        {/* <Route path="/products" element={<ProductsPage />} /> */}
        {/* <Route path="/customers" element={<CustomersPage />} /> */}
        {/* <Route path="/orders" element={<OrdersPage />} /> */}
        {/* <Route path="/debts" element={<DebtsPage />} /> */}

        {/* Exemplo de rota protegida (admin) */}
        {/* <Route path="/admin" element={<AdminPage />} /> */}
      </Routes>
    </Router>
  </React.StrictMode>,
);
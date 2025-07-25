import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import App from './App.tsx'; // Não usaremos App diretamente na rota raiz por enquanto
import './index.css';

// Importar as páginas que vamos criar
import LoginPage from './pages/LoginPage.tsx'; // Login
// import ProductsPage from './pages/ProductsPage.tsx'; // Produtos
// import CustomersPage from './pages/CustomersPage.tsx'; // Clientes
// import OrdersPage from './pages/OrdersPage.tsx';     // Pedidos
// import DebtsPage from './pages/DebtsPage.tsx';       // Dívidas
// import DashboardPage from './pages/DashboardPage.tsx'; // Dashboard (página inicial após login)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* A rota raiz agora leva para a página de login */}
        <Route path="/" element={<LoginPage />} />
        {/* Também pode ter uma rota explícita para /login */}
        <Route path="/login" element={<LoginPage />} />


        {/* Rotas futuras: */}
        {/* A rota do dashboard será aninhada dentro do App, que servirá como layout */}
        {/* <Route path="/" element={<App />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="debts" element={<DebtsPage />} />
        </Route> */}

        {/* Exemplo de rota protegida (admin) */}
        {/* <Route path="/admin" element={<AdminPage />} /> */}
      </Routes>
    </Router>
  </React.StrictMode>,
);
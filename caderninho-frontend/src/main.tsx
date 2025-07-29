import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import CustomersPage from './pages/CustomersPage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';
import DebtsPage from './pages/DebtsPage.tsx';
import ProfitPage from './pages/ProfitPage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AppProvider, useAppContext } from './context/AppContext.tsx'; // Usando AppProvider

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // JS do Bootstrap
import './index.css';

// Componente que engloba todas as rotas e usa o contexto
const AppRouter: React.FC = () => { // Renomeado de RootRedirect para AppRouter
  const { userToken } = useAppContext(); // <<-- AGORA USA USEAPPCONTEXT DENTRO DO APPPROVIDER

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota Raiz: Redireciona para dashboard se logado, senão para login */}
      <Route path="/" element={userToken ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

      {/* Rotas Protegidas:
         - Usa ProtectedRoute como "guarda" (verifica autenticação)
         - Usa App como o layout base (Navbar, Footer, Outlet) para todas as páginas protegidas
      */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<App />}>
          {/* Rotas Protegidas Específicas */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="debts" element={<DebtsPage />} />
          <Route path="profit" element={<ProfitPage />} />

          {/* Se o usuário acessar a raiz '/' enquanto logado, redireciona para /dashboard (redundante, mas seguro) */}
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Rota para 404 (opcional) */}
      {/* <Route path="*" element={<div>Página Não Encontrada</div>} /> */}
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      {/* <<-- AppProvider AGORA ENVOLVE O APPRouter -->> */}
      <AppProvider> 
        <AppRouter /> {/* <<-- AppRouter É RENDERIZADO AQUI, DENTRO DO CONTEXTO */}
      </AppProvider>
    </Router>
  </React.StrictMode>,
);
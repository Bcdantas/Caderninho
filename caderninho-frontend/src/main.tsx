import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx'; // Componente App é o layout principal
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

// Novo componente para a lógica da rota raiz
const RootRedirect: React.FC = () => {
  const { userToken } = useAppContext();
  // Se tiver token, redireciona para dashboard, senão para login
  return userToken ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AppProvider> {/* Este é o provedor do contexto */}
        <Routes> {/* <<-- INÍCIO DO BLOCO DE ROTAS -->> */}

          {/* Rota Raiz: Decide se vai para login ou dashboard baseado no token */}
          <Route path="/" element={<RootRedirect />} /> 

          {/* Rota de Login (explícita) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas Protegidas:
            - Usa ProtectedRoute como "guarda" (verifica autenticação)
            - Usa App como o layout base (Navbar, Footer, Outlet) para todas as páginas protegidas
          */}
          <Route element={<ProtectedRoute />}> {/* <<-- ROTA WRAPPER PARA PROTEÇÃO */}
            <Route path="/" element={<App />}> {/* <<-- ROTA DE LAYOUT PARA ÁREA PROTEGIDA */}
              {/* Rotas Protegidas Específicas (auto-fechantes) */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="debts" element={<DebtsPage />} />
              <Route path="profit" element={<ProfitPage />} />
            </Route> {/* <<-- FECHAMENTO DA ROTA DE LAYOUT DE APP */}
          </Route> {/* <<-- FECHAMENTO DA ROTA WRAPPER ProtectedRoute */}

          {/* Rota para 404 (opcional) */}
          {/* <Route path="*" element={<div>Página Não Encontrada</div>} /> */}

        </Routes> {/* <<-- FIM DO BLOCO DE ROTAS -->> */}
      </AppProvider>
    </Router>
  </React.StrictMode>,
);
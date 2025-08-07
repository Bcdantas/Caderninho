// CAMINHO: src/AppRouter.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Importação dos componentes de página e layout
import App from './App';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import DebtsPage from './pages/DebtsPage';
import ProfitPage from './pages/ProfitPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppRouter: React.FC = () => {
  return (
    <AppProvider>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas Protegidas que usam o Layout Principal (App.tsx) */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<App />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="debts" element={<DebtsPage />} />
            
            {/* Rota aninhada protegida APENAS para o admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="profit" element={<ProfitPage />} />
            </Route>
          </Route>
        </Route>

        {/* Rota "Catch-all" para qualquer endereço não encontrado */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
};

export default AppRouter;
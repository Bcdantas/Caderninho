import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx'; // O componente App agora é o layout principal
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx'; // Importa a nova DashboardPage
import './index.css'; // Importa o CSS global
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa o CSS do Bootstrap 
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Importa o JS do Bootstrap para funcionalidades interativas
import ProductsPage from './pages/ProductsPage.tsx'; // Importa a página de produtos 
import CustomersPage from './pages/CustomersPage.tsx'; // Importa a página de clientes 
import OrdersPage from './pages/OrdersPage.tsx'; // Importa a página de pedidos
import DebtsPage from './pages/DebtsPage.tsx'; // Importa a página de dívidas
import ProfitPage from './pages/ProfitPage.tsx'; // Importa a página de lucro
import ProtectedRoute from './components/ProtectedRoute.tsx'; // Importa o ProtectedRoute
import { AuthProvider } from './context/AppContext.tsx';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider> {/* O AuthProvider deve envolver TODAS as Routes */}
        <Routes>
          {/* Rota de Login (Não Protegida) */}
          <Route path="/login" element={<LoginPage />} />
          {/* Redireciona a raiz para a página de login por padrão */}
          <Route path="/" element={<LoginPage />} /> 

          {/* Rotas Protegidas - Usam o ProtectedRoute como guardião */}
          <Route path="/" element={<ProtectedRoute />}>
            {/* O App é o layout para as rotas aninhadas aqui dentro */}
            <Route path="/" element={<App />}> 
              <Route path="dashboard" element={<DashboardPage />} /> {/* Rota explícita para o dashboard */}
              <Route path="products" element={<ProductsPage />} /> {/* Rota para a página de produtos */}
              <Route path="customers" element={<CustomersPage />} /> {/* Rota para a página de clientes */}
              <Route path="orders" element={<OrdersPage />} /> {/* Rota para a página de pedidos */}
              <Route path="debts" element={<DebtsPage />} /> {/* Rota para a página de dívidas */}
              <Route path="profit" element={<ProfitPage />} /> {/* Rota para a página de lucro */}
     
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
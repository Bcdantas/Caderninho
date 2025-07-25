import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx'; // O componente App agora será nosso layout principal
import LoginPage from './pages/LoginPage.tsx';
import { AuthProvider } from './context/AppContext.tsx'; // Importa o AuthProvider

import 'bootstrap/dist/css/bootstrap.min.css'; // Importa o CSS do Bootstrap
import './index.css'; // Mantenha esta linha para o CSS customizado futuro, se precisar.

// Importar as páginas que vamos criar futuramente
// import DashboardPage from './pages/DashboardPage.tsx'; // Página inicial após login
// import ProductsPage from './pages/ProductsPage.tsx';
// import CustomersPage from './pages/CustomersPage.tsx';
// import OrdersPage from './pages/OrdersPage.tsx';
// import DebtsPage from './pages/DebtsPage.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider> {/* Envolve toda a aplicação com o AuthProvider */}
        <Routes>
          <Route path="/login" element={<LoginPage />} /> {/* Rota de login */}
          <Route path="/" element={<LoginPage />} /> {/* Redireciona raiz para login */}

          {/* A rota base "/" com elemento <App /> será o layout para rotas protegidas */}
          <Route path="/" element={<App />}>
            {/* Futuramente: Rotas Protegidas aqui dentro do App (layout) */}
            {/* Exemplo: <Route path="dashboard" element={<DashboardPage />} /> */}
            {/* Exemplo: <Route path="products" element={<ProductsPage />} /> */}
            {/* Exemplo: <Route path="customers" element={<CustomersPage />} /> */}
            {/* Exemplo: <Route path="orders" element={<OrdersPage />} /> */}
            {/* Exemplo: <Route path="debts" element={<DebtsPage />} /> */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
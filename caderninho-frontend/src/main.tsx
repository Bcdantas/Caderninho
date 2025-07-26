import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx'; // O componente App agora é o layout principal
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx'; // Importa a nova DashboardPage
import ProtectedRoute from './components/ProtectedRoute.tsx'; // Importa o ProtectedRoute
import { AuthProvider } from './context/AppContext.tsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

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
              {/* <Route index element={<DashboardPage />} /> // OPCIONAL: Se quiser que '/' dentro do App seja o dashboard */}

              {/* Futuras rotas protegidas (ex: /products, /customers, etc.) virão aqui */}
              {/* Ex: <Route path="products" element={<ProductsPage />} /> */}
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
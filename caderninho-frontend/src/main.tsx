import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx'; // Componente App será o layout principal
import LoginPage from './pages/LoginPage.tsx';
import { AuthProvider } from './context/AppContext.tsx'; // Importa o AuthProvider

import 'bootstrap/dist/css/bootstrap.min.css'; // Importa o CSS do Bootstrap
import './index.css'; // Mantenha para CSS customizado futuro

// Não vamos importar DashboardPage aqui ainda. Faremos isso no próximo passo.
// import DashboardPage from './pages/DashboardPage.tsx'; 

// Não vamos importar ProtectedRoute aqui ainda. Faremos isso no próximo passo.
// import ProtectedRoute from './components/ProtectedRoute.tsx'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider> {/* Envolve toda a aplicação com o AuthProvider */}
        <Routes>
          {/* Rotas de Login */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} /> {/* A raiz redireciona para o login */}

          {/* A rota base "/" com elemento <App /> será o layout para rotas protegidas
              Mas não vamos aninhar nada aqui ainda. Faremos isso depois de testar o login. */}
          <Route path="/app-layout-test" element={<App />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
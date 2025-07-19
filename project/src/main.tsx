import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx'; // Importar o AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> {/* Envolve o App com o AuthProvider */}
      <App />
    </AuthProvider>
  </StrictMode>
);
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Definição das interfaces
interface AppContextType {
  username: string | null;
  userRole: string | null;
  userToken: string | null;
  login: (token: string, name: string, role: string) => void;
  logout: () => void;
  showToast: (message: string, type: 'success' | 'danger' | 'info') => void;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'info';
}

// Criação do Contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provedor do Contexto
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializa o estado lendo do localStorage
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));
  const [userToken, setUserToken] = useState<string | null>(localStorage.getItem('userToken'));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();

  // Função de login
  const login = useCallback((token: string, name: string, role: string) => {
    setUserToken(token);
    setUsername(name);
    setUserRole(role);
    // Salva no localStorage
    localStorage.setItem('userToken', token);
    localStorage.setItem('username', name);
    localStorage.setItem('userRole', role);
    showToast('Login realizado com sucesso!', 'success');
  }, []);

  // Função de logout
  const logout = useCallback(() => {
    setUserToken(null);
    setUsername(null);
    setUserRole(null);
    // Remove do localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    showToast('Você foi desconectado.', 'info');
    navigate('/login'); // Redireciona para a página de login
  }, [navigate]);

  // Função para mostrar toasts
  const showToast = useCallback((message: string, type: 'success' | 'danger' | 'info') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000); // Toast desaparece após 5 segundos
  }, []);

  return (
    <AppContext.Provider value={{ username, userRole, userToken, login, logout, showToast }}>
      {children}
      {/* Renderização dos Toasts */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1050, // Bootstrap modal z-index é 1050
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`alert alert-${toast.type} alert-dismissible fade show`}
            role="alert"
            style={{ minWidth: '250px', marginBottom: '10px' }}
          >
            {toast.message}
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
              onClick={() => setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toast.id))}
            ></button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
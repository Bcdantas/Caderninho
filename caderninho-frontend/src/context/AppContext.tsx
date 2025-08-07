// CAMINHO: src/context/AppContext.tsx

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

// --- Interfaces ---
interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
}

interface AppContextType {
  username: string | null;
  userRole: string | null;
  userToken: string | null;
  establishmentName: string | null;
  login: (token: string, name: string, role: string, establishment: string) => void;
  logout: () => void;
  showToast: (message: string, type: 'success' | 'danger' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provedor do Contexto ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'));
  const [userToken, setUserToken] = useState<string | null>(() => localStorage.getItem('userToken'));
  const [establishmentName, setEstablishmentName] = useState<string | null>(() => localStorage.getItem('establishmentName'));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const navigate = useNavigate();

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);

  const login = useCallback((token: string, name: string, role: string, establishment: string) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('username', name);
    localStorage.setItem('userRole', role);
    localStorage.setItem('establishmentName', establishment);
    setUserToken(token);
    setUsername(name);
    setUserRole(role);
    setEstablishmentName(establishment);
    showToast('Login realizado com sucesso!', 'success');
    navigate('/dashboard');
  }, [navigate, showToast]);

  const logout = useCallback(() => {
    localStorage.clear();
    setUserToken(null);
    setUsername(null);
    setUserRole(null);
    setEstablishmentName(null);
    showToast('Você foi desconectado.', 'info');
    navigate('/login');
  }, [navigate, showToast]);

  // A correção do loop infinito está aqui.
  // useMemo garante que o objeto 'value' só seja recriado se uma de suas dependências mudar.
  const value = useMemo(() => ({
    username,
    userRole,
    userToken,
    establishmentName,
    login,
    logout,
    showToast
  }), [username, userRole, userToken, establishmentName, login, logout, showToast]);

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
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
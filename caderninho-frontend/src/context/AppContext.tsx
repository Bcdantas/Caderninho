// CAMINHO: src/context/AppContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

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
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'));
  const [userToken, setUserToken] = useState<string | null>(() => localStorage.getItem('userToken'));
  const [establishmentName, setEstablishmentName] = useState<string | null>(() => localStorage.getItem('establishmentName'));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const navigate = useNavigate();

  const showToast = useCallback((message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
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

  return (
    <AppContext.Provider value={{ username, userRole, userToken, establishmentName, login, logout, showToast, toasts, removeToast }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
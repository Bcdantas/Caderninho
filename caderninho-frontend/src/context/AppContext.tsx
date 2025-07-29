import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Definição das interfaces
interface AppContextType {
  username: string | null;
  userRole: string | null;
  userToken: string | null;
  login: (token: string, name: string, role: string) => void;
  logout: () => void;
  showToast: (message: string, type: 'success' | 'danger' | 'info' | 'warning') => void; // Tipo 'warning' adicionado
  toasts: ToastMessage[]; // Toasts adicionado
  removeToast: (id: string) => void; // removeToast adicionado
}

// Criação do Contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provedor do Contexto
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado de autenticação (NÃO lê do localStorage na inicialização para evitar loops complexos agora)
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]); // Estado para os toasts

  const navigate = useNavigate();

  // Função de login (APENAS SETA ESTADO, NÃO USA localStorage AQUI)
  const login = useCallback((token: string, name: string, role: string) => {
    setUserToken(token);
    setUsername(name);
    setUserRole(role);
    localStorage.setItem('userToken', token);
    localStorage.setItem('username', name);
    localStorage.setItem('userRole', role);
    console.log('*** AppContext: Login bem-sucedido, estado e localStorage atualizados. Token:', token ? 'SIM' : 'NÃO', 'Role:', role); // <<-- NOVO LOG
    showToast('Login realizado com sucesso!', 'success');
    navigate('/dashboard'); // Tenta redirecionar
}, [navigate, showToast]);

  // Função de logout (APENAS LIMPA ESTADO, NÃO USA localStorage AQUI)
  const logout = useCallback(() => { // Adicionado showToast como dependência
    setUserToken(null);
    setUsername(null);
    setUserRole(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    console.log('*** AppContext: Logout realizado, estado e localStorage limpos.'); // <<-- NOVO LOG
    showToast('Você foi desconectado.', 'info');
    navigate('/login');
}, [navigate, showToast]);

  // Função para mostrar toasts (como estava)
  const showToast = useCallback((message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  // Função para remover toasts (como estava)
  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // REMOVIDO: O useEffect que lia do localStorage e redirecionava.
  // A persistência de login será implementada de outra forma no futuro.

  return (
    <AppContext.Provider value={{ username, userRole, userToken, login, logout, showToast, toasts, removeToast }}>
      {children}
      {/* O container de toasts é renderizado no App.tsx */}
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
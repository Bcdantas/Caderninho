import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Definir a interface para o que o contexto vai prover
interface AuthContextType {
  isAuthenticated: boolean;
  userToken: string | null;
  userRole: string | null;
  username: string | null;
  login: (token: string, role: string, username: string) => void;
  logout: () => void;
}

// 2. Criar o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Criar o Provider (o componente que vai prover o contexto para a aplicação)
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsernameState] = useState<string | null>(null); 

  const navigate = useNavigate();

  // Ao carregar, verifica se há token no localStorage
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    const storedUsername = localStorage.getItem('username');

    if (token && role && storedUsername) {
      setIsAuthenticated(true);
      setUserToken(token);
      setUserRole(role);
      setUsernameState(storedUsername);
    }
  }, []);

  const login = (token: string, role: string, user: string) => {
    setIsAuthenticated(true);
    setUserToken(token);
    setUserRole(role);
    setUsernameState(user);
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', user);
    navigate('/dashboard'); // Redireciona para o dashboard (criaremos esta rota em breve)
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserToken(null);
    setUserRole(null);
    setUsernameState(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userToken, userRole, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook customizado para usar o contexto
export const useAppContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AuthProvider');
  }
  return context;
};
import React, { createContext, useState, useContext } from 'react';
import { User, Role } from '../types';

// --- NOSSA SIMULAÇÃO DE BANCO DE DADOS DE USUÁRIOS ---
// Em um app real, isso viria de um servidor.
const mockUsers: User[] = [
  { id: '1', username: 'admin', password: '123', role: 'admin', name: 'Administrador' },
  { id: '2', username: 'garcom', password: '123', role: 'waiter', name: 'Garçom' },
];
// ----------------------------------------------------

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = mockUsers.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (foundUser) {
      // Remove a senha do objeto antes de salvar no estado por segurança
      const { password, ...userToSave } = foundUser;
      setUser(userToSave);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
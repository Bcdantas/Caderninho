// CAMINHO: src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import { useAppContext } from '../context/AppContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAppContext();
  const [establishmentName, setEstablishmentName] = useState('Carregando nome...');

  useEffect(() => {
    const fetchEstablishmentName = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/establishment-name`);
        const data = await response.json();
        if (data.establishmentName) {
          setEstablishmentName(data.establishmentName);
        } else {
          setEstablishmentName('Caderninho');
        }
      } catch (error) {
        console.error("Falha ao buscar nome do estabelecimento:", error);
        setEstablishmentName('Caderninho');
      }
    };
    fetchEstablishmentName();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao tentar logar.');
      }
      const data = await response.json();
      login(data.token, data.username, data.role, data.establishmentName);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao tentar logar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <LoginForm 
        onSubmit={handleLogin} 
        loading={loading} 
        error={error} 
        establishmentName={establishmentName} 
      />
    </div>
  );
};

export default LoginPage;
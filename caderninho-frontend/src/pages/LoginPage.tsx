// CAMINHO: src/pages/LoginPage.tsx

import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { useAppContext } from '../context/AppContext';
import './LoginPage.css'; // <<< PASSO 1: Importar o novo arquivo de CSS

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAppContext();

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
      login(data.token, data.role, data.username);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao tentar logar.');
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <<< PASSO 2: Usar a nova classe de container para centralizar o formulário >>>
    <div className="login-page-container">
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
};

export default LoginPage;
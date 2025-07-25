import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm'; // Importa o formulário de login

// Este será um passo futuro: Contexto de Autenticação
// import { useAppContext } from '../context/AppContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Futuramente, usaremos o contexto para lidar com o login
  // const { login } = useAppContext();

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null); // Limpa erros anteriores

    try {
      // *** ESTE É ONDE FAREMOS A REQUISIÇÃO PARA O BACKEND ***
      // Por enquanto, uma simulação:
      if (username === 'admin' && password === '123') {
        console.log('Login simulado com sucesso!');
        // Futuramente: await login(username, password);
        navigate('/dashboard'); // Redireciona para o dashboard após o login
      } else {
        throw new Error('Usuário ou senha inválidos (simulado).');
      }
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao tentar logar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
};

export default LoginPage;
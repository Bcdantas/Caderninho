import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { useAppContext } from '../context/AppContext'; // Importa o hook do contexto

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar o hook do contexto para acessar a função de login
  const { login } = useAppContext();

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fazer a requisição POST para o backend
      const response = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Envia o usuário e senha como JSON
      });

      // 2. Verificar a resposta
      if (!response.ok) { // Se a resposta não for 2xx (ex: 401, 400, 500)
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao tentar logar.');
      }

      // 3. Processar a resposta de sucesso
      const data = await response.json(); // Pega os dados da resposta (token, _id, username, role)

      // 4. Chamar a função login do contexto para guardar os dados e redirecionar
      login(data.token, data.role, data.username); // O contexto cuida do redirecionamento

    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao tentar logar.');
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
};

export default LoginPage;
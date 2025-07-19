import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">Caderninho</h1>
        <p className="text-center text-slate-500 mb-8">Faça o login para continuar</p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-slate-700 font-bold mb-2" htmlFor="username">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-700 font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
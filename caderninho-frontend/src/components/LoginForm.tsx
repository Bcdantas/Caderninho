// CAMINHO: src/components/LoginForm.tsx

import React, { useState } from 'react';
// <<< PASSO 1: Importar ícones >>>
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password);
  };

  return (
    // <<< PASSO 2: Aplicar novo estilo ao card do formulário >>>
    <form onSubmit={handleSubmit} className="login-form-card" style={{ maxWidth: '400px', width: '100%' }}>
      <h2 className="text-center mb-1">Bem-vindo ao</h2>
      <h1 className="text-center text-primary mb-4">Caderninho</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* <<< PASSO 3: Usar 'input-group' do Bootstrap para adicionar ícones >>> */}
      <div className="input-group mb-3">
        <span className="input-group-text">
          <FontAwesomeIcon icon={faUser} />
        </span>
        <input
          type="text"
          id="username"
          className="form-control form-control-lg"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="input-group mb-4">
        <span className="input-group-text">
          <FontAwesomeIcon icon={faLock} />
        </span>
        <input
          type="password"
          id="password"
          className="form-control form-control-lg"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
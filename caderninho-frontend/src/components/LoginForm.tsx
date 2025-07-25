import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita o recarregamento da página
    onSubmit(username, password);
  };

  return (
    // Classes Bootstrap para estilizar o formulário
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
      <h2 className="card-title text-center mb-4">Login</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="username" className="form-label">
          Usuário:
        </label>
        <input
          type="text"
          id="username"
          className="form-control" // Classe Bootstrap para campos de formulário
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Senha:
        </label>
        <input
          type="password"
          id="password"
          className="form-control" // Classe Bootstrap para campos de formulário
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="d-grid gap-2"> {/* d-grid gap-2 para o botão ocupar a largura total */}
        <button
          type="submit"
          className="btn btn-primary" // Classe Bootstrap para botão primário
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
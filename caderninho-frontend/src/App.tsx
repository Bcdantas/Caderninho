import React from 'react';
import { Outlet, Link } from 'react-router-dom'; // Link para navegação
import { useAppContext } from './context/AppContext'; // Importa o contexto para logout

function App() {
  const { isAuthenticated, logout, username, userRole } = useAppContext(); // Pega funções e dados do contexto

  return (
    <div className="d-flex flex-column min-vh-100 bg-light"> {/* Layout principal com Bootstrap */}
      {/* Navbar (Barra de Navegação) */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">Caderninho</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {isAuthenticated && (
                <>
                  {/* Por enquanto, só o link para o Dashboard. Outros links virão depois. */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  </li>
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/products">Produtos</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customers">Clientes</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/orders">Pedidos</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/debts">Dívidas</Link>
                    </li>
                  </>
                </>
              )}
            </ul>
            <ul className="navbar-nav">
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <span className="nav-link text-white">Olá, {username} ({userRole})</span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-outline-light" onClick={logout}>Sair</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal, onde as páginas protegidas serão renderizadas */}
      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>

      {/* Footer (Opcional) */}
      <footer className="footer mt-auto py-3 bg-dark text-white text-center">
        <div className="container">
          <span>&copy; 2025 Caderninho. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
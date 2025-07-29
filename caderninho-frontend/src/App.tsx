import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import ToastNotification from './components/ToastNotification';

// Defina a interface ToastMessage
interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  message: string;
}

function App() {
  const { logout, username, userRole, userToken } = useAppContext();

  // Adicione o estado para toasts e a função removeToast
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

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
              {userToken && (
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
                    {userRole === 'admin' && ( // <<-- ADICIONADO: Visível apenas para Admin
                      <li className="nav-item">
                        <Link className="nav-link" to="/profit">Lucro</Link>
                      </li>
                    )}  
                  </>
                </>
              )}
            </ul>
            <ul className="navbar-nav">
              {userToken && (
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
      <footer>
        {/* Container para as notificações Toast */}
        <div
          className="toast-container position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 11 }} // Garante que fique acima de outros elementos
        >
          {toasts.map((toast) => (
            <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
// CAMINHO: src/App.tsx

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import ToastNotification from './components/ToastNotification';

// <<< PASSO 1: IMPORTAR OS ÍCONES E O COMPONENTE FontAwesomeIcon >>>
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faBoxOpen, 
  faUsers, 
  faReceipt, 
  faFileInvoiceDollar, 
  faSignOutAlt,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';

// Defina a interface ToastMessage
interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  message: string;
}

function App() {
  const { logout, username, userRole, userToken } = useAppContext();
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar (Barra de Navegação) */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">Caderninho</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            {/* <<< PASSO 2: ADICIONAR OS ÍCONES AOS LINKS DO MENU >>> */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {userToken && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      <FontAwesomeIcon icon={faChartLine} className="me-2" />
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/products">
                      <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                      Produtos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/customers">
                      <FontAwesomeIcon icon={faUsers} className="me-2" />
                      Clientes
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/orders">
                      <FontAwesomeIcon icon={faReceipt} className="me-2" />
                      Pedidos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/debts">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                      Dívidas
                    </Link> 
                  </li>
                  {userRole === 'admin' && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/profit">
                        <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                        Lucro
                      </Link>
                    </li>
                  )}  
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
                    <button className="btn btn-outline-light" onClick={logout}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      Sair
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>

      {/* Footer (Opcional) e Toasts */}
      <footer>
        <div
          className="toast-container position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 11 }}
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
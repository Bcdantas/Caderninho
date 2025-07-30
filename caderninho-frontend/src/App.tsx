// CAMINHO: src/App.tsx

import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import ToastNotification from './components/ToastNotification';

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

  // Estado para controlar se o menu está recolhido
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // Função para inverter o estado do menu
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">Caderninho</Link>
          
          {/* Botão do menu modificado para usar o onClick do React */}
          <button 
            className="navbar-toggler" 
            type="button" 
            aria-controls="navbarNav" 
            aria-expanded={!isNavCollapsed} 
            aria-label="Toggle navigation"
            onClick={handleNavCollapse}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Container do menu com classe 'show' controlada pelo React */}
          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {userToken && (
                <>
                  {/* onClick adicionado para fechar o menu ao navegar */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard" onClick={() => setIsNavCollapsed(true)}>
                      <FontAwesomeIcon icon={faChartLine} className="me-2" />
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/products" onClick={() => setIsNavCollapsed(true)}>
                      <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                      Produtos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/customers" onClick={() => setIsNavCollapsed(true)}>
                      <FontAwesomeIcon icon={faUsers} className="me-2" />
                      Clientes
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/orders" onClick={() => setIsNavCollapsed(true)}>
                      <FontAwesomeIcon icon={faReceipt} className="me-2" />
                      Pedidos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/debts" onClick={() => setIsNavCollapsed(true)}>
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                      Dívidas
                    </Link> 
                  </li>
                  {userRole === 'admin' && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/profit" onClick={() => setIsNavCollapsed(true)}>
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

      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>

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
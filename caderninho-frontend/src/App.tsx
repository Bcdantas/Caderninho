// CAMINHO: src/App.tsx

import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faBoxOpen, faUsers, faReceipt, 
  faFileInvoiceDollar, faSignOutAlt, faDollarSign 
} from '@fortawesome/free-solid-svg-icons';

function App() {
  const { logout, username, userRole, userToken, establishmentName } = useAppContext();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/dashboard">
            {establishmentName || 'Caderninho'}
          </Link>
          <button className="navbar-toggler" type="button" onClick={handleNavCollapse}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {userToken && (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/dashboard" onClick={() => setIsNavCollapsed(true)}><FontAwesomeIcon icon={faChartLine} className="me-2" />Dashboard</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/products" onClick={() => setIsNavCollapsed(true)}><FontAwesomeIcon icon={faBoxOpen} className="me-2" />Produtos</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/customers" onClick={() => setIsNavCollapsed(true)}><FontAwesomeIcon icon={faUsers} className="me-2" />Clientes</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/orders" onClick={() => setIsNavCollapsed(true)}><FontAwesomeIcon icon={faReceipt} className="me-2" />Pedidos</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/debts" onClick={() => setIsNavCollapsed(true)}><FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />Fiados</Link></li>
                  {userRole === 'admin' && (<li className="nav-item"><Link className="nav-link" to="/profit" onClick={() => setIsNavCollapsed(true)}><FontAwesomeIcon icon={faDollarSign} className="me-2" />Painel Financeiro</Link></li>)}
                </>
              )}
            </ul>
            <ul className="navbar-nav">
              {userToken && (
                <>
                  <li className="nav-item"><span className="nav-link text-white">Olá, {username} ({userRole})</span></li>
                  <li className="nav-item"><button className="btn btn-outline-light" onClick={logout}><FontAwesomeIcon icon={faSignOutAlt} className="me-2" />Sair</button></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <main className="flex-grow-1 p-4"><Outlet /></main>
    </div>
  );
}

export default App;
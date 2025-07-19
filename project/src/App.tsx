import { AppProvider, useApp } from './context/AppContext'; // <--- MUDANÇA AQUI: Adicionar useApp
import { useAuth } from './context/AuthContext';
import AppLayout from './components/Layout';
import ProductList from './components/ProductList';
import CustomerList from './components/CustomerList';
import OrderList from './components/OrderList';
import DebtList from './components/DebtList';
import LoginScreen from './components/LoginScreen';

const AppContent: React.FC = () => {
  // Agora o useApp está disponível aqui!
  const { activeTab } = useApp(); // LINHA 11: o erro indicava aqui
  
  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductList />;
      case 'customers':
        return <CustomerList />;
      case 'debts':
        return <DebtList />;
      case 'orders':
      default:
        return <OrderList />;
    }
  };

  return (
    <AppLayout>
      {renderContent()}
    </AppLayout>
  );
};

function App() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
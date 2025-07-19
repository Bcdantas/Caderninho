import React from 'react';
import { ShoppingCart, Package, Users, DollarSign, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext'; // Importe o useAuth

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { activeTab, setActiveTab } = useApp();
  const { logout, user } = useAuth(); // Obtenha a função de logout e o usuário logado

  const tabs = [
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'debts', label: 'Dívidas', icon: DollarSign },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-amber-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Caderninho</h1>
        <div className="flex items-center space-x-4">
          {user && ( // Mostra o nome do usuário se estiver logado
            <span className="text-sm">Olá, {user.name}!</span>
          )}
          <button
            onClick={logout} // Botão de logout
            className="flex items-center p-2 rounded-full hover:bg-amber-700 transition-colors"
            aria-label="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <nav className="bg-white shadow-sm py-2">
        <ul className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id as any)} // Força o tipo para AppTab
                  className={`flex flex-col items-center p-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-gray-600 hover:text-amber-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className="mb-1" />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="flex-grow p-4 container mx-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
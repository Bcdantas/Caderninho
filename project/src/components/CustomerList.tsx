import React, { useState } from 'react';
import { Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CustomerForm from './CustomerForm';
import { Customer } from '../types';

const CustomerList: React.FC = () => {
  const { customers, deleteCustomer } = useApp();
  const { isWaiter } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (customer) => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteCustomer(id);
    }
  };

  if (isAdding || editingCustomer) {
    return (
      <CustomerForm
        customer={editingCustomer || undefined}
        onCancel={() => {
          setIsAdding(false);
          setEditingCustomer(null);
        }}
        onSave={() => {
          setIsAdding(false);
          setEditingCustomer(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Clientes</h2>
        {!isWaiter && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus size={18} className="mr-1" />
            Novo Cliente
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          {searchTerm ? (
            <p>Nenhum cliente encontrado para "{searchTerm}"</p>
          ) : (
            <p>Nenhum cliente cadastrado. Adicione seu primeiro cliente!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{customer.name}</h3>
                </div>
                {customer.hasDebt && (
                  <span className="flex items-center text-red-600 text-sm">
                    <AlertCircle size={16} className="mr-1" />
                    Pendente
                  </span>
                )}
              </div>

              {!isWaiter && (
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setEditingCustomer(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(customer._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    aria-label="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerList;
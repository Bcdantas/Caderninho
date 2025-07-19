import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';

interface CustomerFormProps {
  customer?: Customer;
  onCancel: () => void;
  onSave?: (customer: Customer) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onCancel, onSave }) => {
  const { addCustomer, updateCustomer } = useApp();
  
  const [name, setName] = useState(customer?.name || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nome do cliente é obrigatório');
      return;
    }
    
    let savedCustomer: Customer | undefined;
    
    if (customer) {
      const updatedCustomer = { 
        ...customer, 
        name: name.trim(),
      };
      savedCustomer = await updateCustomer(updatedCustomer);
    } else {
      savedCustomer = await addCustomer({ name: name.trim() });
    }
    
    if (onSave && savedCustomer) {
      onSave(savedCustomer);
    }
    
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {customer ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
          Nome *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          autoFocus
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
        >
          {customer ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
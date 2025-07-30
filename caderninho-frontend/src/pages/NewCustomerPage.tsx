import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'; // Ícone para loading

// Definição da interface do Cliente (definida aqui para evitar erros de importação)
interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalDebt: number;
  createdAt: string;
  updatedAt: string;
}

const NewCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  const handleSave = () => {
    // A CustomerForm já exibe o toast de sucesso.
    navigate('/customers'); // Redireciona de volta para a lista de clientes após salvar
  };

  const handleCancel = () => {
    navigate('/customers'); // Volta para a lista sem salvar
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Adicionar Novo Cliente</h2>
      <CustomerForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default NewCustomerPage;
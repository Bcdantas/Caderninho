import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'; // Ícone para loading

// Definição da interface do Produto (definida aqui para evitar erros de importação)
interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  // stock?: number; // Removido stock se nao esta no seu modelo Product.js
  createdAt: string;
  updatedAt: string;
}

const NewProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  const handleSave = () => {
    // A ProductForm já exibe o toast de sucesso.
    navigate('/products'); // Redireciona de volta para a lista de produtos após salvar
  };

  const handleCancel = () => {
    navigate('/products'); // Volta para a lista sem salvar
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Adicionar Novo Produto</h2>
      <ProductForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default NewProductPage;
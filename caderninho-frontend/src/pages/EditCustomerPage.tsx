import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditCustomerPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>(); // Pega o ID do cliente da URL
  const navigate = useNavigate();
  const { userToken, showToast } = useAppContext();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerId && userToken) {
      const fetchCustomer = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers/${customerId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao buscar cliente para edição.');
          }
          const data: Customer = await response.json();
          setCustomer(data);
        } catch (err: any) {
          setError(err.message || 'Erro ao carregar cliente para edição.');
          showToast(err.message || 'Erro ao carregar cliente.', 'danger');
          navigate('/customers'); // Volta para a lista se der erro ao carregar
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    } else {
        // Se não tem ID na URL ou não tem token, redireciona para a lista
        navigate('/customers'); 
    }
  }, [customerId, userToken, navigate, showToast]); // Adiciona dependências

  const handleSave = () => {
    // A CustomerForm já exibe o toast de sucesso.
    navigate('/customers'); // Redireciona de volta para a lista de clientes após salvar
  };

  const handleCancel = () => {
    navigate('/customers'); // Volta para a lista sem salvar
  };

  if (loading) return <div className="text-center mt-5"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" /><p className="mt-2">Carregando cliente para edição...</p></div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;
  if (!customer) return <div className="alert alert-warning mt-3">Cliente não encontrado para edição ou ID inválido.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Editar Cliente</h2>
      <CustomerForm customer={customer} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default EditCustomerPage;
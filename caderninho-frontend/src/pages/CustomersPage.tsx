import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import CustomerForm from '../components/CustomerForm';

// *** DEFINIÇÃO DA INTERFACE CUSTOMER ATUALIZADA AQUI ***
interface Customer {
  _id: string;
  name: string;
  phone?: string; // Opcional
  createdAt: string;
  updatedAt: string;
  totalDebt?: number; // <<-- ADICIONADO: Campo para a dívida total
}
// ******************************************************

const CustomersPage: React.FC = () => {
  const { userToken, showToast } = useAppContext(); // Adicionado showToast para notificações
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [userToken]);

  const fetchCustomers = async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      // Usar a rota de users/customers que agora retorna totalDebt
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar clientes.');
      }
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar clientes.');
      console.error('Erro ao carregar clientes:', err);
      showToast(err.message || 'Erro ao carregar clientes.', 'danger'); // Notificação de erro
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este cliente? Isso também removerá suas dívidas e pedidos associados.')) { // Adicionado aviso
      return;
    }
    if (!userToken) {
      setError('Você precisa estar logado para deletar clientes.');
      showToast('Você precisa estar logado para deletar clientes.', 'danger');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao deletar cliente.');
      }
      setCustomers(customers.filter(c => c._id !== id));
      showToast('Cliente deletado com sucesso!', 'success'); // Notificação de sucesso
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar cliente.');
      console.error('Erro ao deletar cliente:', err);
      showToast(err.message || 'Erro ao deletar cliente.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  if (loading) return <div className="text-center mt-5">Carregando clientes...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Clientes</h2>

      {showForm ? (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <button className="btn btn-primary mb-3" onClick={handleAddCustomer}>
            Adicionar Cliente
          </button>

          {customers.length === 0 ? (
            <div className="alert alert-info">Nenhum cliente cadastrado.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
               <thead><tr>
          <th>Nome</th><th>Telefone</th><th>Dívida Total</th><th>Ações</th>
        </tr></thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer._id}>
              <td>{customer.name}</td>
              <td>{customer.phone || 'N/A'}</td>
              <td>
                {customer.totalDebt !== undefined ? (
                  <span className={customer.totalDebt > 0 ? 'text-danger fw-bold' : 'text-success'}>
                    R$ {customer.totalDebt.toFixed(2).replace('.', ',')}
                  </span>
                ) : 'R$ 0,00'}
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEditCustomer(customer)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteCustomer(customer._id)}
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomersPage;
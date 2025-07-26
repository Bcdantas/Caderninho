import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

// *** DEFINIÇÃO DA INTERFACE CUSTOMER AQUI ***
interface Customer {
  _id: string;
  name: string;
  phone?: string; // Opcional
  createdAt: string;
  updatedAt: string;
  // totalDebt?: number;
}
// *******************************************

interface CustomerFormProps {
  customer?: Customer | null; // Cliente opcional para edição
  onSave: () => void; // Callback após salvar
  onCancel: () => void; // Callback para cancelar
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
  const { userToken } = useAppContext();
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se um cliente for passado (modo edição), preenche o formulário
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || '');
    } else {
      // Limpa o formulário se não houver cliente (modo adição)
      setName('');
      setPhone('');
    }
    setError(null);
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) {
      setError('Você precisa estar logado para realizar esta operação.');
      return;
    }

    setLoading(true);
    setError(null);

    // Validação básica
    if (!name) {
      setError('Nome do cliente é obrigatório.');
      setLoading(false);
      return;
    }

    const customerData = {
      name,
      phone: phone || undefined // Envia undefined se vazio para não salvar string vazia
    };

    const method = customer ? 'PUT' : 'POST';
    const url = customer ? `http://localhost:4000/api/customers/${customer._id}` : 'http://localhost:4000/api/customers';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Falha ao ${customer ? 'atualizar' : 'criar'} cliente.`);
      }

      alert(`Cliente ${customer ? 'atualizado' : 'criado'} com sucesso!`);
      onSave(); // Chama o callback para fechar o formulário e recarregar a lista
    } catch (err: any) {
      setError(err.message || `Erro ao ${customer ? 'atualizar' : 'criar'} cliente.`);
      console.error(`Erro ao ${customer ? 'atualizar' : 'criar'} cliente:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <h4 className="mb-3">{customer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h4>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="customerName" className="form-label">Nome do Cliente</label>
          <input
            type="text"
            className="form-control"
            id="customerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="customerPhone" className="form-label">Telefone (Opcional)</label>
          <input
            type="text"
            className="form-control"
            id="customerPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn btn-success me-2" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
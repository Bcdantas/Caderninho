import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

// *** DEFINIÇÃO DE INTERFACES NECESSÁRIAS AQUI (Workaround) ***
interface Product {
  _id: string;
  name: string;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
  phone?: string;
}

interface OrderItem {
  product: Product; // O produto populado
  quantity: number;
  priceAtOrder: number;
}

interface Order {
  _id: string;
  customer: Customer; // O cliente populado
  items: OrderItem[];
  totalAmount: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Debt {
  _id: string;
  customer: Customer; // O cliente populado
  order: Order; // O pedido populado
  amount: number;
  isPaid: boolean;
  debtDate: string;
  createdAt: string;
  updatedAt: string;
}
// ***************************************************************

const DebtsPage: React.FC = () => {
  const { userToken } = useAppContext();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDebts();
  }, [userToken]);

  const fetchDebts = async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      // Por padrão, buscaremos apenas dívidas não pagas
      const response = await fetch('http://localhost:4000/api/debts?isPaid=false', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar dívidas.');
      }
      const data: Debt[] = await response.json();
      setDebts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dívidas.');
      console.error('Erro ao carregar dívidas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (debtId: string) => {
    if (!window.confirm('Tem certeza que deseja marcar esta dívida como paga?')) {
      return;
    }
    if (!userToken) {
      setError('Você precisa estar logado para realizar esta operação.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Chama a rota de marcar dívida como paga
      const response = await fetch(`http://localhost:4000/api/debts/${debtId}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao marcar dívida como paga.');
      }
      // Remove a dívida da lista (já que estamos mostrando apenas as não pagas)
      setDebts(debts.filter(d => d._id !== debtId));
      alert('Dívida marcada como paga com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao marcar dívida como paga.');
      console.error('Erro ao marcar dívida como paga:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Carregando dívidas...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Contas Pendentes (Dívidas)</h2>

      {debts.length === 0 ? (
        <div className="alert alert-info">Não há dívidas pendentes no momento.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Pedido</th>
                <th>Data da Dívida</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {debts.map(debt => (
                <tr key={debt._id}>
                  <td>{debt.customer ? debt.customer.name : 'Desconhecido'}</td>
                  <td>R$ {debt.amount ? debt.amount.toFixed(2).replace('.', ',') : '0,00'}</td>
                  <td>
                    {debt.order ? (
                      <ul className="list-unstyled mb-0">
                        {debt.order.items.map(item => (
                          <li key={item.product._id || item.product}>
                            {item.product ? item.product.name : 'Produto Desconhecido'} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    ) : 'Pedido Desconhecido'}
                  </td>
                  <td>{new Date(debt.debtDate).toLocaleDateString()}</td>
                  <td>
                    {!debt.isPaid && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAsPaid(debt._id)}
                        title="Marcar como Pago"
                      >
                        Pagar Dívida
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DebtsPage;
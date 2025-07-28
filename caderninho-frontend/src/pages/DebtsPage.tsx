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
  product: Product;
  quantity: number;
  priceAtOrder: number;
}

interface Order {
  _id: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Debt {
  _id: string;
  customer: Customer;
  order: Order;
  amount: number;
  isPaid: boolean;
  debtDate: string;
  createdAt: string;
  updatedAt: string;
}

// NOVA INTERFACE: Para agrupar dívidas por cliente
interface GroupedDebt {
    customer: Customer;
    totalDebt: number;
    individualDebts: Debt[]; // Lista dos pedidos (dívidas) individuais desse cliente
}
// ***************************************************************

const DebtsPage: React.FC = () => {
  const { userToken, showToast } = useAppContext();
  const [groupedDebts, setGroupedDebts] = useState<GroupedDebt[]>([]); // Estado para dívidas agrupadas
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null); // Para controlar qual cliente está expandido

  useEffect(() => {
    fetchDebts();
  }, [userToken]);

  const fetchDebts = async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/debts?isPaid=false`, {
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

      // --- Lógica para Agrupar Dívidas por Cliente ---
      const debtsMap = new Map<string, GroupedDebt>(); // Usa um Map para agrupar

      data.forEach(debt => {
        const customerId = debt.customer?._id;
         if (!debt.customer || !debt.customer._id) {
        console.warn('Dívida ignorada devido a cliente nulo ou sem _id:', debt);
        return; // Pula esta dívida se o cliente não for válido

        const customerId = debt.customer._id;
  }
          if (!debtsMap.has(customerId)) {
        debtsMap.set(customerId, {
        customer: debt.customer, // Usa o objeto customer que sabemos ser válido
        totalDebt: 0,
        individualDebts: []
        });
  }
        const grouped = debtsMap.get(customerId)!;
        grouped.totalDebt += debt.amount;
        grouped.individualDebts.push(debt);
      });

      // Converte o Map de volta para um array para o estado
      setGroupedDebts(Array.from(debtsMap.values()));

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dívidas.');
      console.error('Erro ao carregar dívidas:', err);
      showToast(err.message || 'Erro ao carregar dívidas.', 'danger');
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
      showToast('Você precisa estar logado para realizar esta operação.', 'danger');
      return;
    }

    setLoading(true); // Pode ser um loading local ou global, por enquanto global
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/debts/${debtId}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao marcar dívida como paga.');
      }

      // Após marcar como pago, refaz a busca para atualizar a lista
      showToast('Dívida marcada como paga com sucesso!', 'success');
      fetchDebts(); // Recarrega todas as dívidas para atualizar o agrupamento

    } catch (err: any) {
      setError(err.message || 'Erro ao marcar dívida como paga.');
      console.error('Erro ao marcar dívida como paga:', err);
      showToast(err.message || 'Erro ao marcar dívida como paga.', 'danger');
    } finally {
      setLoading(false); // Ajuste se for um loading local
    }
  };

  const toggleExpand = (customerId: string) => {
    setExpandedCustomerId(prevId => (prevId === customerId ? null : customerId));
  };

  if (loading) return <div className="text-center mt-5">Carregando dívidas...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Contas Pendentes (Dívidas)</h2>

      {groupedDebts.length === 0 ? (
        <div className="alert alert-info">Não há dívidas pendentes no momento.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Total Dívida</th>
                <th>Detalhes</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>{groupedDebts.map(groupedDebt => (
              <React.Fragment key={groupedDebt.customer?._id || groupedDebt.customer?.name || groupedDebt.customer?.phone || Math.random().toString()}>
                <tr onClick={() => toggleExpand(groupedDebt.customer?._id || '')} style={{ cursor: 'pointer' }}>
                  <td>{groupedDebt.customer?.name || 'Cliente Desconhecido'}</td>
                  <td>
                    <span className="text-danger fw-bold">
                      R$ {groupedDebt.totalDebt.toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={(e) => { e.stopPropagation(); toggleExpand(groupedDebt.customer?._id || ''); }}
                    >
                      {expandedCustomerId === groupedDebt.customer._id ? 'Ocultar' : 'Ver Detalhes'}
                    </button>
                  </td>
                  <td>
                    {/* Botão de Pagar Dívida Total - Futuramente */}
                  </td>
                </tr>
                {expandedCustomerId === groupedDebt.customer._id && (
                  <tr>
                    <td colSpan={4}>
                      <div className="bg-light p-3 border rounded mb-3">
                        <h6>Pedidos em Dívida de {groupedDebt.customer?.name || 'Cliente Desconhecido'}:</h6>
                        <ul className="list-group">
                          {groupedDebt.individualDebts.map(debt => (
                            <li key={debt._id} className="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                Pedido: <span className="fw-bold">R$ {debt.amount.toFixed(2).replace('.', ',')}</span>
                                <br />
                                <small className="text-muted">Data: {new Date(debt.debtDate).toLocaleDateString()}</small>
                                <ul className="list-unstyled ms-3 mt-1 small">
                                  {debt.order && debt.order.items.map(item => (
                                    <li key={item.product?._id || item.product}>
                                      {item.product ? item.product.name : 'Produto Desconhecido'} (x{item.quantity})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(debt._id); }}
                                title="Marcar este pedido como Pago"
                              >
                                Pagar Este
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DebtsPage;
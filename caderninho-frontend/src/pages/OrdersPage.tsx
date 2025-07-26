import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import OrderForm from '../components/OrderForm'; // Formulário para adicionar pedidos

// *** DEFINIÇÃO DE INTERFACES NECESSÁRIAS AQUI (Workaround) ***
interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  totalDebt?: number; // Adicionado para exibir total da dívida, se populado pelo backend
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
// ***************************************************************

const OrdersPage: React.FC = () => {
  const { userToken } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    fetchOrders();
  }, [userToken]);

  const fetchOrders = async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/orders', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar pedidos.');
      }
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pedidos.');
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = () => {
    setShowForm(true);
  };

  const handleMarkAsPaid = async (orderId: string) => {
    if (!window.confirm('Tem certeza que deseja marcar este pedido como pago? Isso também pagará a dívida associada.')) {
      return;
    }
    if (!userToken) {
      setError('Você precisa estar logado para realizar esta operação.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao marcar pedido como pago.');
      }
      // Atualiza o estado do pedido na lista
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, isPaid: true } : order
      ));
      alert('Pedido marcado como pago com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao marcar pedido como pago.');
      console.error('Erro ao marcar pedido como pago:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este pedido? Isso também removerá a dívida associada.')) {
      return;
    }
    if (!userToken) {
      setError('Você precisa estar logado para deletar pedidos.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao deletar pedido.');
      }
      setOrders(orders.filter(order => order._id !== orderId));
      alert('Pedido deletado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar pedido.');
      console.error('Erro ao deletar pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false); // Fecha o formulário após criar o pedido
    fetchOrders(); // Recarrega a lista para mostrar o novo pedido
  };

  if (loading) return <div className="text-center mt-5">Carregando pedidos...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Pedidos</h2>

      {showForm ? (
        <OrderForm
          onSave={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <button className="btn btn-primary mb-3" onClick={handleAddOrder}>
            Criar Novo Pedido
          </button>

          {orders.length === 0 ? (
            <div className="alert alert-info">Nenhum pedido cadastrado.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Produtos</th>
                    <th>Total</th>
                    <th>Pago?</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order.customer ? order.customer.name : 'Desconhecido'}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {order.items.map(item => (
                            <li key={item.product._id || item.product}> {/* Fallback para _id se não populado */}
                              {item.product ? item.product.name : 'Produto Desconhecido'} (x{item.quantity})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>R$ {order.totalAmount.toFixed(2).replace('.', ',')}</td>
                      <td>
                        {order.isPaid ? (
                          <span className="badge bg-success">Sim</span>
                        ) : (
                          <span className="badge bg-danger">Não</span>
                        )}
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        {!order.isPaid && (
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleMarkAsPaid(order._id)}
                            title="Marcar como Pago"
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Deletar Pedido"
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

export default OrdersPage;
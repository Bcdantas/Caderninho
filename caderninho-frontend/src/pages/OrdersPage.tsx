import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import OrderForm from '../components/OrderForm';
import PaymentModal from '../components/PaymentModal'; // <<-- VERIFIQUE AQUI

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

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
  createdAt: string;
  updatedAt: string;
  totalDebt?: number;
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
// ***************************************************************

const OrdersPage: React.FC = () => {
  const { userToken, showToast } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  // Novos estados para o modal de pagamento
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [orderToPay, setOrderToPay] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [userToken]);

  const fetchOrders = async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
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
      showToast(err.message || 'Erro ao carregar pedidos.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  // *** IMPORTANTE: ESTA FUNÇÃO SÓ ABRE O MODAL, NÃO TEM 'AWAIT FETCH' ***
  const handleMarkAsPaid = (order: Order) => { // <<-- SEM 'ASYNC' E SEM 'AWAIT FETCH' AQUI!
      setOrderToPay(order); // Define qual pedido será pago
      setShowPaymentModal(true); // Abre o modal
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este pedido? Isso também removerá a dívida associada.')) {
      return;
    }
    if (!userToken) {
      setError('Você precisa estar logado para deletar pedidos.');
      showToast('Você precisa estar logado para deletar pedidos.', 'danger');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}`, {
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
      showToast('Pedido deletado com sucesso!', 'success');
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar pedido.');
      console.error('Erro ao deletar pedido:', err);
      showToast(err.message || 'Erro ao deletar pedido.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingOrder(null);
    fetchOrders();
  };

  // Callback de sucesso do PaymentModal
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false); 
    setOrderToPay(null);       
    fetchOrders(); 
};

  if (loading) return <div className="text-center mt-5">Carregando pedidos...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Pedidos</h2>

      {showForm ? (
        <OrderForm
          order={editingOrder}
          onSave={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <button className="btn btn-primary mb-3" onClick={handleAddOrder}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Criar Novo Pedido
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
                            <li key={typeof item.product === 'string' ? item.product : item.product?._id || 'produto-desconhecido'}>
                              {item.product ? (typeof item.product === 'string' ? item.product : item.product.name) : 'Produto Desconhecido'} (x{item.quantity})
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
                            onClick={() => handleMarkAsPaid(order)} // Passa o objeto 'order' inteiro
                            title="Pagar"
                          >
                            <FontAwesomeIcon icon={faCheckCircle} /> Pagar
                          </button>
                        )}
                        <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => handleEditOrder(order)}
                            title="Editar Pedido"
                            disabled={order.isPaid}
                        >
                            <FontAwesomeIcon icon={faEdit} /> Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Deletar Pedido"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Deletar
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

      {/* Componente PaymentModal */}
      <PaymentModal
          order={orderToPay}
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default OrdersPage;
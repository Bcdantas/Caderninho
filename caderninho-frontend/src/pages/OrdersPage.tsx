// CAMINHO: src/pages/OrdersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faDollarSign, faShareSquare } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';
// Ajuste o caminho do import conforme a localização correta do arquivo Order.ts
import type { Order, OrderItem } from '../types/Order';
import type { Product } from '../types/Product';
// Ajuste o caminho do import conforme a localização correta do arquivo Customer.ts
import type { Customer } from '../types/Customer';

interface OrderWithDetails extends Order {
  customer: Customer;
  items: Array<OrderItem & { product: Product }>;
}

const OrdersPage: React.FC = () => {
  const { userToken, showToast, logout } = useAppContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithDetails | null>(null);
  
  const [isSendingToDebt, setIsSendingToDebt] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${userToken}` },
      });
      if (response.status === 401) { logout(); return; }
      if (!response.ok) {
        throw new Error('Falha ao buscar pedidos.');
      }
      const data: OrderWithDetails[] = await response.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [userToken, showToast, logout]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEditOrder = (order: OrderWithDetails) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    fetchOrders();
  };
  
  const handleDeleteOrder = async (orderId: string) => {
    if (!userToken || !window.confirm('Tem certeza que deseja deletar este pedido? O estoque será ajustado.')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userToken}` },
      });
      if (!response.ok) {
        throw new Error('Falha ao deletar pedido.');
      }
      showToast('Pedido deletado com sucesso!', 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message, 'danger');
    }
  };

  const handlePayForOrder = async (orderId: string) => {
    if (!userToken || !window.confirm('Tem certeza que deseja marcar este pedido como pago?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ paidAmount: 0, paymentMethod: 'Dinheiro' })
      });
      if (!response.ok) {
        throw new Error('Falha ao marcar pedido como pago.');
      }
      showToast('Pedido pago e removido com sucesso!', 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message, 'danger');
    }
  };

  const handleSendToDebt = async (orderId: string) => {
    if (!userToken || !window.confirm('Tem certeza que deseja mover este pedido para a dívida do cliente?')) return;
    setIsSendingToDebt(orderId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/send-to-debt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao mover pedido para a dívida.');
      }
      showToast('Pedido movido para a dívida com sucesso!', 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message, 'danger');
    } finally {
      setIsSendingToDebt(null);
    }
  };

  if (loading) return <div className="text-center mt-5"><h4>Carregando pedidos...</h4></div>;
  if (error) return <div className="container mt-4 alert alert-danger"><strong>Erro:</strong> {error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pedidos Pendentes</h2>
        <button className="btn btn-primary" onClick={handleCreateOrder}>+ Novo Pedido</button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <OrderForm 
              onClose={() => setShowForm(false)} 
              onSubmit={handleFormSubmit}
              orderToEdit={editingOrder}
            />
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="alert alert-info">Nenhum pedido pendente no momento.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Cliente</th>
                <th>Total</th>
                <th>Data</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="fw-bold">{order.customer?.name || 'Cliente Desconhecido'}</td>
                  <td>R$ {order.totalAmount.toFixed(2).replace('.', ',')}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="text-center">
                    <button className="btn btn-info btn-sm me-2" onClick={() => handleEditOrder(order)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="btn btn-success btn-sm me-2" onClick={() => handlePayForOrder(order._id)}>
                      <FontAwesomeIcon icon={faDollarSign} />
                    </button>
                    <button 
                      className="btn btn-warning btn-sm" 
                      onClick={() => handleSendToDebt(order._id)}
                      disabled={isSendingToDebt === order._id}
                    >
                      <FontAwesomeIcon icon={faShareSquare} />
                      {isSendingToDebt === order._id ? ' Movendo...' : ''}
                    </button>
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

export default OrdersPage;
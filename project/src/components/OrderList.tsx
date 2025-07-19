import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import OrderForm from './OrderForm';

const OrderList: React.FC = () => {
  const { orders, getCustomerById, getProductById, deleteOrder, markOrderAsPaid } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((order) => {
    const customer = order.customerId ? getCustomerById(order.customerId) : null;
    const customerName = customer ? customer.name.toLowerCase() : '';
    const orderDate = new Date(order.date).toLocaleDateString();

    return (
      customerName.includes(searchTerm.toLowerCase()) ||
      orderDate.includes(searchTerm) ||
      order.items.some(item => {
        const product = getProductById(item.productId);
        return product ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      })
    );
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      await deleteOrder(id);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (window.confirm('Tem certeza que deseja marcar este pedido como pago?')) {
      await markOrderAsPaid(id);
    }
  };

  if (isAdding) {
    return <OrderForm onCancel={() => setIsAdding(false)} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pedidos</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus size={18} className="mr-1" />
          Novo Pedido
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar pedidos por cliente, produto ou data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          {searchTerm ? (
            <p>Nenhum pedido encontrado para "{searchTerm}"</p>
          ) : (
            <p>Nenhum pedido cadastrado. Adicione seu primeiro pedido!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const customer = order.customerId ? getCustomerById(order.customerId) : null;
            return (
              <div
                key={order._id}
                className={`bg-white rounded-lg shadow-md p-4 ${order.isPaid ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">
                      {customer ? customer.name : 'Cliente Avulso'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()} às{' '}
                      {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.isPaid ? 'Pago' : 'Pendente'}
                  </span>
                </div>

                <ul className="list-disc list-inside text-gray-700 mb-3">
                  {order.items.map((item) => {
                    const product = getProductById(item.productId);
                    return (
                      <li key={item.productId}>
                        {product ? product.name : 'Produto Desconhecido'} (x{item.quantity})
                      </li>
                    );
                  })}
                </ul>

                <p className="text-xl font-bold text-right text-amber-700">
                  Total: R$ {order.total.toFixed(2)}
                </p>

                <div className="flex justify-end space-x-2 mt-3">
                  {!order.isPaid && (
                    <button
                      onClick={() => handleMarkAsPaid(order._id)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                      aria-label="Marcar como pago"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    aria-label="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderList;
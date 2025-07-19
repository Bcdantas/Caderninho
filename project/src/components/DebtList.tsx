import React, { useState } from 'react';
import { DollarSign, Eye, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, Order } from '../types';

const DebtList: React.FC = () => {
  const { customers, orders, getProductById, markOrderAsPaid } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filtra os clientes que têm hasDebt = true
  const customersWithDebt = customers.filter(c => c.hasDebt);

  // Obtém os pedidos não pagos de um cliente específico
  const getCustomerDebts = (customerId: string) => {
    return orders.filter(
      (order) => order.customerId === customerId && !order.isPaid
    );
  };

  // Calcula o total da dívida de um cliente
  const calculateCustomerTotalDebt = (customerId: string) => {
    const debts = getCustomerDebts(customerId);
    return debts.reduce((total, order) => total + order.total, 0);
  };

  // Lidar com a marcação de um pedido específico como pago
  const handleMarkDebtAsPaid = async (orderId: string) => {
    if (window.confirm('Tem certeza que deseja marcar este pedido como pago?')) {
      await markOrderAsPaid(orderId); // Esta função já chama refreshData internamente
      // Não precisa de setCustomers ou setOrders aqui, pois refreshData fará isso
      if (selectedCustomer) { // Se um cliente está selecionado, reavalie as dívidas dele
        const remainingDebts = getCustomerDebts(selectedCustomer._id);
        if (remainingDebts.length === 0) {
          setSelectedCustomer(null); // Sai da visualização de dívidas do cliente se todas foram pagas
        }
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Contas Pendentes</h2>

      {selectedCustomer ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <button onClick={() => setSelectedCustomer(null)} className="mr-2 text-gray-500 hover:text-gray-700">
              &larr;
            </button>
            {selectedCustomer.name}
            <span className="ml-auto text-amber-700">
              Total: R$ {calculateCustomerTotalDebt(selectedCustomer._id).toFixed(2)}
            </span>
          </h3>

          {getCustomerDebts(selectedCustomer._id).length === 0 ? (
            <p className="text-center py-4">Nenhum pedido pendente para este cliente.</p>
          ) : (
            <div className="space-y-4">
              {getCustomerDebts(selectedCustomer._id).map((order) => (
                <div key={order._id} className="border border-red-200 bg-red-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-red-800">Pedido em {new Date(order.date).toLocaleDateString()}</p>
                    <ul className="list-disc list-inside text-red-700 text-sm">
                      {order.items.map(item => {
                        const product = getProductById(item.productId);
                        return <li key={item.productId}>{product ? product.name : 'Produto Desconhecido'} (x{item.quantity})</li>;
                      })}
                    </ul>
                    <p className="text-lg font-bold text-red-900 mt-1">R$ {order.total.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleMarkDebtAsPaid(order._id)}
                    className="p-2 bg-green-200 text-green-700 rounded-full hover:bg-green-300 transition-colors"
                    aria-label="Marcar pedido como pago"
                  >
                    <DollarSign size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {customersWithDebt.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p>Nenhum cliente com dívidas no momento. Tudo limpo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customersWithDebt.map((customer) => (
                <div
                  key={customer._id}
                  className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-bold text-lg text-red-800">{customer.name}</h3>
                  <p className="text-gray-600">
                    Dívida Total: <span className="font-bold text-red-700">R$ {calculateCustomerTotalDebt(customer._id).toFixed(2)}</span>
                  </p>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      aria-label="Ver detalhes"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DebtList;
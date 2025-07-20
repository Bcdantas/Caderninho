import React, { useState } from 'react';
import { DollarSign, Eye } from 'lucide-react'; // Removido XCircle
import { useApp } from '../context/AppContext';
import { Customer, Debt } from '../types'; // Removido Order

const DebtList: React.FC = () => {
  const { customers, orders, getProductById, markOrderAsPaid, debts } = useApp(); // Pegue 'debts' do contexto
  const [selectedCustomerDebt, setSelectedCustomerDebt] = useState<Debt | null>(null); // Use Debt para o estado

  // customersWithDebt agora é construído a partir da coleção 'debts'
  const customersWithDebt = debts.filter(d => d.totalDebt > 0).map(debt => {
    const customer = customers.find(c => c._id === debt.customerId);
    // Adiciona o totalDebt diretamente ao objeto do cliente para exibição
    // Note: 'hasDebt: true' é uma propriedade virtual para indicar que ele está na lista de devedores
    return customer ? { ...customer, hasDebt: true, totalDebt: debt.totalDebt } : undefined;
  }).filter(Boolean) as (Customer & { totalDebt: number })[]; // Filtra undefined e garante o tipo

  const getCustomerDebts = (customerId: string) => {
    // Filtre os pedidos não pagos para este cliente
    // Os pedidos aqui já devem vir populados do AppContext, se o backend está ok
    return orders.filter(
      (order) => order.customerId === customerId && !order.isPaid
    );
  };

  // A função calculateCustomerTotalDebt foi removida, pois totalDebt já vem na coleção Debt.
  // const calculateCustomerTotalDebt = (customerId: string) => { /* ... */ };

  const handleMarkDebtAsPaid = async (orderId: string) => {
    if (window.confirm('Tem certeza que deseja marcar este pedido como pago?')) {
      await markOrderAsPaid(orderId); // Esta função já chama refreshData internamente no AppContext
      // Após marcar como pago, o refreshData do AppContext vai atualizar as 'debts'
      // Re-checa se o cliente selecionado ainda tem dívidas para sair da visualização se zerou
      if (selectedCustomerDebt) {
        const updatedDebtEntry = debts.find(d => d.customerId === selectedCustomerDebt.customerId);
        if (!updatedDebtEntry || updatedDebtEntry.totalDebt === 0) {
          setSelectedCustomerDebt(null); // Sai da visualização se a dívida foi zerada
        }
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Contas Pendentes</h2>

      {selectedCustomerDebt ? ( // Usar selectedCustomerDebt para determinar a exibição detalhada
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <button onClick={() => setSelectedCustomerDebt(null)} className="mr-2 text-gray-500 hover:text-gray-700">
              &larr;
            </button>
            {/* Busca o nome do cliente pelo customerId que está no objeto Debt selecionado */}
            {customers.find(c => c._id === selectedCustomerDebt.customerId)?.name}
            <span className="ml-auto text-amber-700">
              Total: R$ {selectedCustomerDebt.totalDebt.toFixed(2)} {/* Mostra totalDebt direto do objeto Debt */}
            </span>
          </h3>

          {getCustomerDebts(selectedCustomerDebt.customerId).length === 0 ? (
            <p className="text-center py-4">Nenhum pedido pendente para este cliente.</p>
          ) : (
            <div className="space-y-4">
              {getCustomerDebts(selectedCustomerDebt.customerId).map((order) => (
                <div key={order._id} className="border border-red-200 bg-red-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-red-800">Pedido em {new Date(order.date).toLocaleDateString()}</p>
                    <ul className="list-disc list-inside text-red-700 text-sm">
                      {order.items.map(item => {
                        // getProductById busca no estado 'products' do AppContext
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
        // Visualização dos cards de clientes com dívida na lista geral
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
                    Dívida Total: <span className="font-bold text-red-700">R$ {customer.totalDebt?.toFixed(2) || '0.00'}</span> {/* Usa totalDebt do cliente populado */}
                  </p>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      // Passa o objeto Debt real para o estado selectedCustomerDebt
                      onClick={() => setSelectedCustomerDebt(debts.find(d => d.customerId === customer._id) || null)}
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
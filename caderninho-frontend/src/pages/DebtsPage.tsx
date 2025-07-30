// CAMINHO: caderninho-frontend/src/pages/DebtsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

// --- Interfaces ---
interface Product { _id: string; name: string; price: number; }
interface Customer { _id: string; name: string; phone?: string; }
interface OrderItem { product: Product; quantity: number; priceAtOrder: number; }
interface Order { _id: string; customer: Customer; items: OrderItem[]; totalAmount: number; isPaid: boolean; createdAt: string; updatedAt: string; }
interface Debt { _id:string; customer: Customer; order: Order; amount: number; isPaid: boolean; createdAt: string; }
interface GroupedDebt { customer: Customer; totalDebt: number; individualDebts: Debt[]; }

const DebtsPage: React.FC = () => {
  const { userToken, showToast } = useAppContext();
  const [groupedDebts, setGroupedDebts] = useState<GroupedDebt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/debts`, {
        headers: { 'Authorization': `Bearer ${userToken}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar dívidas.');
      }
      const data: Debt[] = await response.json();

      const debtsMap = new Map<string, GroupedDebt>();
      data.forEach(debt => {
        if (!debt.customer?._id) return;
        const customerId = debt.customer._id;
        if (!debtsMap.has(customerId)) {
          debtsMap.set(customerId, {
            customer: debt.customer,
            totalDebt: 0,
            individualDebts: []
          });
        }
        const grouped = debtsMap.get(customerId)!;
        grouped.totalDebt += debt.amount;
        grouped.individualDebts.push(debt);
      });
      setGroupedDebts(Array.from(debtsMap.values()));
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [userToken, showToast]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleMarkAsPaid = async (debtId: string) => {
    if (!window.confirm('Tem certeza que deseja marcar esta dívida como paga?')) {
      return;
    }
    if (!userToken) {
      showToast('Você precisa estar logado.', 'danger');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/debts/${debtId}/pay`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'Dinheiro' }) // Enviando um método de pagamento padrão
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao marcar dívida como paga.');
      }

      showToast('Dívida paga com sucesso!', 'success');
      fetchDebts(); // Recarrega a lista de dívidas para remover a que foi paga
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'danger');
    }
  };

  const toggleExpand = (customerId: string) => {
    setExpandedCustomerId(prevId => (prevId === customerId ? null : customerId));
  };

  if (loading) return <div className="text-center mt-5"><h4>Carregando dívidas...</h4></div>;
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Contas Pendentes</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {groupedDebts.length === 0 ? (
        <div className="alert alert-info">Não há dívidas pendentes no momento.</div>
      ) : (
        <div className="accordion" id="debtsAccordion">
          {groupedDebts.map(groupedDebt => (
            <div className="accordion-item" key={groupedDebt.customer._id}>
              <h2 className="accordion-header" id={`heading-${groupedDebt.customer._id}`}>
                <button 
                  className={`accordion-button ${expandedCustomerId !== groupedDebt.customer._id ? 'collapsed' : ''}`} 
                  type="button" 
                  onClick={() => toggleExpand(groupedDebt.customer._id)}
                >
                  <span className="fw-bold me-auto">{groupedDebt.customer.name}</span>
                  <span className="text-danger fw-bold">Total: R$ {groupedDebt.totalDebt.toFixed(2).replace('.', ',')}</span>
                </button>
              </h2>
              <div 
                id={`collapse-${groupedDebt.customer._id}`} 
                className={`accordion-collapse collapse ${expandedCustomerId === groupedDebt.customer._id ? 'show' : ''}`}
              >
                <div className="accordion-body">
                  <h6>Pedidos em Dívida:</h6>
                  <ul className="list-group">
                    {groupedDebt.individualDebts.map(debt => (
                      <li key={debt._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          Pedido de <span className="fw-bold">R$ {debt.amount.toFixed(2).replace('.', ',')}</span>
                          <br />
                          <small className="text-muted">Data: {new Date(debt.createdAt).toLocaleDateString('pt-BR')}</small>
                        </div>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMarkAsPaid(debt._id)}
                          title="Marcar este pedido como Pago"
                        >
                          Pagar Este
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebtsPage;
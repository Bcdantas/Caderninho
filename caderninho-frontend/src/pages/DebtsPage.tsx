// CAMINHO: src/pages/DebtsPage.tsx

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
  const { userToken, showToast, logout } = useAppContext();
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
        if (response.status === 401) {
          showToast('Sua sessão expirou. Por favor, faça o login novamente.', 'warning');
          logout();
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar fiados.');
      }
      
      const data: Debt[] = await response.json();
      const validData = data.filter(debt => debt.customer && debt.customer._id);
      const debtsMap = new Map<string, GroupedDebt>();
      validData.forEach(debt => {
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
    } finally {
      setLoading(false);
    }
  }, [userToken, showToast, logout]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleMarkAsPaid = async (debtId: string) => {
    if (!window.confirm('Tem certeza que deseja marcar este fiado como pago?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/debts/${debtId}/pay`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'Dinheiro' })
      });
      if (!response.ok) {
        if (response.status === 401) {
          showToast('Sua sessão expirou. Por favor, faça o login novamente.', 'warning');
          logout();
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao marcar fiado como pago.');
      }
      showToast('Fiado pago com sucesso!', 'success');
      fetchDebts();
    } catch (err: any) {
      showToast(err.message, 'danger');
    }
  };

  const toggleExpand = (customerId: string) => {
    setExpandedCustomerId(prevId => (prevId === customerId ? null : customerId));
  };

  if (loading) return <div className="text-center mt-5"><h4>Carregando fiados...</h4></div>;
  if (error) return <div className="container mt-4 alert alert-danger"><strong>Erro:</strong> {error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Fiados Pendentes</h2>
      {groupedDebts.length === 0 ? (
        <div className="alert alert-info">Não há fiados pendentes no momento.</div>
      ) : (
        <div className="accordion" id="debtsAccordion">
          {groupedDebts.map(groupedDebt => (
            <div className="accordion-item" key={groupedDebt.customer._id}>
              <h2 className="accordion-header">
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
                className={`accordion-collapse collapse ${expandedCustomerId === groupedDebt.customer._id ? 'show' : ''}`}
              >
                <div className="accordion-body">
                  <h6>Pedidos do Fiado:</h6>
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
                          title="Marcar este fiado como Pago"
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
// CAMINHO: src/pages/DebtsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import PartialPaymentModal from '../components/PartialPaymentModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

export interface Debtor {
  customerId: string;
  customerName: string;
  totalDebt: number;
}

const DebtsPage: React.FC = () => {
  const { userToken, showToast, logout } = useAppContext();
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [debtorToPay, setDebtorToPay] = useState<Debtor | null>(null);

  const fetchDebtsSummary = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/debts/summary`, {
        headers: { 'Authorization': `Bearer ${userToken}` },
      });

      if (!response.ok) {
        if (response.status === 401) { logout(); return; }
        throw new Error('Falha ao buscar o resumo de fiados.');
      }
      
      const data: Debtor[] = await response.json();
      setDebtors(data);

    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [userToken, showToast, logout]);

  useEffect(() => {
    fetchDebtsSummary();
  }, [fetchDebtsSummary]);

  const handleOpenPaymentModal = (debtor: Debtor) => {
    setDebtorToPay(debtor);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchDebtsSummary();
  };

  if (loading) return <div className="text-center mt-5"><h4>Carregando fiados...</h4></div>;
  if (error) return <div className="container mt-4 alert alert-danger"><strong>Erro:</strong> {error}</div>;

  return (
    <>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Fiados Pendentes por Cliente</h2>
            <button className="btn btn-secondary" onClick={fetchDebtsSummary} disabled={loading}>
                <FontAwesomeIcon icon={faSyncAlt} className="me-2" />
                Recarregar
            </button>
        </div>

        {debtors.length === 0 ? (
          <div className="alert alert-info">Não há fiados pendentes no momento.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Cliente</th>
                  <th className="text-end">Saldo Devedor Total</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {debtors.map(debtor => (
                  <tr key={debtor.customerId}>
                    <td className="fw-bold">{debtor.customerName}</td>
                    <td className="text-end text-danger fw-bold">
                      R$ {debtor.totalDebt.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleOpenPaymentModal(debtor)}
                        disabled={debtor.totalDebt <= 0}
                      >
                        <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                        Pagar / Abater
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PartialPaymentModal
        key={debtorToPay?.customerId || 'initial'}
        debt={debtorToPay}
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={handlePaymentSuccess}
      />
    </>
  );
};

export default DebtsPage;
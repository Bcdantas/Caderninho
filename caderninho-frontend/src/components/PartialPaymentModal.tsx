// CAMINHO: src/components/PartialPaymentModal.tsx

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Debtor } from '../pages/DebtsPage';

interface PartialPaymentModalProps {
  debt: Debtor | null;
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PartialPaymentModal: React.FC<PartialPaymentModalProps> = ({ debt, show, onClose, onSave }) => {
  const { userToken, showToast } = useAppContext();
  
  // =======================================================
  // ## LÓGICA DE ESTADO SIMPLIFICADA ##
  // Usa o valor do prop 'debt' diretamente.
  // A propriedade 'key' no componente pai garante que o estado seja resetado.
  const [amountPaid, setAmountPaid] = useState(debt?.totalDebt.toFixed(2) || '');
  // =======================================================
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt || !debt.customerId) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/debts/customer/${debt.customerId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          amountPaid: parseFloat(amountPaid),
          paymentMethod: 'Dinheiro'
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao registrar pagamento.');
      }
      showToast('Pagamento parcial registrado com sucesso!', 'success');
      onSave();
      handleClose();
    } catch (error: any) {
      showToast(error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmountPaid('');
    onClose();
  };

  if (!show || !debt) {
      return null;
  }
  
  if (!debt.customerName || debt.totalDebt === undefined) {
    console.error("Dados de dívida incompletos para renderizar o modal.", debt);
    return null;
  }

  return (
    <>
      <div className="modal show fade" style={{ display: 'block' }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Registrar Pagamento Parcial</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <p>Cliente: <strong>{debt.customerName}</strong></p>
              <p>Saldo Devedor: <strong className="text-danger">R$ {debt.totalDebt.toFixed(2).replace('.', ',')}</strong></p>
              <hr />
              <form onSubmit={handleSubmit} id="partial-payment-form">
                <div className="mb-3">
                  <label htmlFor="amountPaid" className="form-label">Valor a Pagar (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="amountPaid"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>Cancelar</button>
              <button type="submit" form="partial-payment-form" className="btn btn-success" disabled={loading}>
                {loading ? 'Registrando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default PartialPaymentModal;
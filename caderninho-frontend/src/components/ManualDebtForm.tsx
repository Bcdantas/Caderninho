// CAMINHO: src/components/ManualDebtForm.tsx

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

// Interfaces
interface Customer {
  _id: string;
  name: string;
}

interface ManualDebtFormProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  customers: Customer[]; // Recebe a lista de clientes
}

const ManualDebtForm: React.FC<ManualDebtFormProps> = ({ show, onClose, onSave, customers }) => {
  const { userToken, showToast } = useAppContext();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/debts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          amount: parseFloat(amount),
          description: description
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar fiado.');
      }
      showToast('Fiado manual criado com sucesso!', 'success');
      onSave();
      resetForm();
    } catch (error: any) {
      showToast(error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setAmount('');
    setDescription('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show fade" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Criar Fiado Manual</h5>
            <button type="button" className="btn-close" onClick={resetForm}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} id="manual-debt-form">
              <div className="mb-3">
                <label htmlFor="customer" className="form-label">Cliente</label>
                <select id="customer" className="form-select" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required>
                  <option value="">Selecione um cliente</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="amount" className="form-label">Valor (R$)</label>
                <input type="number" step="0.01" className="form-control" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Observação (Obrigatório)</label>
                <textarea className="form-control" id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>Cancelar</button>
            <button type="submit" form="manual-debt-form" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Fiado'}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default ManualDebtForm;
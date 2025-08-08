// CAMINHO: src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faPlus, faMinus, faLockOpen, faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

interface CaixaStatus {
  status: 'open' | 'closed';
  initialBalance: number;
  currentBalance: number;
  transactions?: any[];
  caixaId?: string;
}

const Dashboard: React.FC = () => {
  const { userToken, showToast } = useAppContext();
  const navigate = useNavigate();
  const [caixa, setCaixa] = useState<CaixaStatus | null>(null);
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [transactionAmount, setTransactionAmount] = useState<string>('');
  const [transactionDescription, setTransactionDescription] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'inflow' | 'outflow'>('outflow');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCaixaStatus = async () => {
    if (!userToken) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/caixa/status`, {
        headers: { 'Authorization': `Bearer ${userToken}` },
      });
      if (!response.ok) {
        throw new Error('Falha ao buscar status do caixa.');
      }
      const data: CaixaStatus = await response.json();
      setCaixa(data);
    } catch (error: any) {
      showToast(error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaixaStatus();
  }, [userToken]);

  const handleOpenCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken || !initialBalance) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/caixa/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ initialBalance: parseFloat(initialBalance) })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao abrir o caixa.');
      }
      showToast('Caixa aberto com sucesso!', 'success');
      setInitialBalance('');
      fetchCaixaStatus();
    } catch (error: any) {
      showToast(error.message, 'danger');
    }
  };

  const handleCloseCaixa = async () => {
    if (!userToken || !caixa?.caixaId) return;
    if (!window.confirm('Tem certeza que deseja fechar o caixa do dia?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/caixa/close`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao fechar o caixa.');
      }
      showToast('Caixa fechado com sucesso!', 'success');
      fetchCaixaStatus();
    } catch (error: any) {
      showToast(error.message, 'danger');
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken || !transactionAmount || !transactionDescription) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/caixa/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          type: transactionType,
          amount: parseFloat(transactionAmount),
          description: transactionDescription
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao registrar transação.');
      }
      showToast('Transação registrada com sucesso!', 'success');
      setTransactionAmount('');
      setTransactionDescription('');
      fetchCaixaStatus();
    } catch (error: any) {
      showToast(error.message, 'danger');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>
      {loading ? (
        <div className="text-center mt-5"><h4>Carregando...</h4></div>
      ) : (
        <div className="row">
          {/* Nova Seção do Caixa */}
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <span><FontAwesomeIcon icon={faCashRegister} className="me-2" /> Controle de Caixa</span>
                {caixa?.status === 'open' && (
                  <button className="btn btn-danger btn-sm" onClick={handleCloseCaixa}>
                    <FontAwesomeIcon icon={faLock} className="me-2" />Fechar Caixa
                  </button>
                )}
              </div>
              <div className="card-body">
                {caixa?.status === 'closed' ? (
                  <form onSubmit={handleOpenCaixa}>
                    <div className="alert alert-warning">O caixa está fechado para o dia de hoje.</div>
                    <div className="mb-3">
                      <label htmlFor="initialBalance" className="form-label">Saldo Inicial (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        id="initialBalance"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success">
                      <FontAwesomeIcon icon={faLockOpen} className="me-2" />Abrir Caixa
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="fs-5">
                      Status: <span className="badge bg-success">Aberto</span>
                    </p>
                    <p className="fs-3 fw-bold">
                      Saldo Atual: <span className="text-success">R$ {caixa?.currentBalance?.toFixed(2).replace('.', ',')}</span>
                    </p>
                    <p>Saldo Inicial: R$ {caixa?.initialBalance?.toFixed(2).replace('.', ',')}</p>

                    <hr />

                    <h6>Registrar Transação Manual</h6>
                    <form onSubmit={handleAddTransaction}>
                      <div className="input-group mb-3">
                        <select
                          className="form-select"
                          value={transactionType}
                          onChange={(e) => setTransactionType(e.target.value as 'inflow' | 'outflow')}
                        >
                          <option value="outflow">Saída</option>
                          <option value="inflow">Entrada</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          placeholder="Valor (R$)"
                          value={transactionAmount}
                          onChange={(e) => setTransactionAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Descrição"
                          value={transactionDescription}
                          onChange={(e) => setTransactionDescription(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className={`btn btn-${transactionType === 'inflow' ? 'success' : 'danger'} w-100`}>
                        <FontAwesomeIcon icon={transactionType === 'inflow' ? faPlus : faMinus} className="me-2" />
                        Registrar
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Manter os Resumos aqui */}
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h6>Resumos do Dia</h6>
              </div>
              <div className="card-body">
                {/* Você pode adicionar os resumos existentes aqui, como lucros, débitos, etc. */}
                <p>Resumo de Lucros: R$ 0,00</p>
                <p>Débitos Pendentes: 5</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
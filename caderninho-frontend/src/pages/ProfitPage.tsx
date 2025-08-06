// CAMINHO: src/pages/ProfitPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import Pagination from '../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, faChartLine, faCalendarDay, faCalendarWeek, faCalendarAlt,
  faPlus, faArrowDown, faEdit, faTrash, faTimes,
  faHistory, faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';

// --- Interfaces ---
interface PeriodSummary { gains: number; losses: number; net: number; }
interface ProfitSummary { today: PeriodSummary; yesterday: PeriodSummary; thisWeek: PeriodSummary; thisMonth: PeriodSummary; total: PeriodSummary; }
interface Expense { _id: string; amount: number; description: string; createdAt: string; }
interface Payment {
  _id: string;
  customer: { _id: string; name: string; };
  amount: number;
  paymentMethod: string;
  createdAt: string;
}

const ProfitPage: React.FC = () => {
  const { userToken, showToast } = useAppContext();
  const [summary, setSummary] = useState<ProfitSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPages, setPaymentPages] = useState(1);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const [profitRes, expensesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/profit-summary`, { headers: { 'Authorization': `Bearer ${userToken}` } }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/expenses`, { headers: { 'Authorization': `Bearer ${userToken}` } })
      ]);
      if (!profitRes.ok) throw new Error('Falha ao buscar o resumo de lucros.');
      if (!expensesRes.ok) throw new Error('Falha ao buscar as despesas.');
      const summaryData: ProfitSummary = await profitRes.json();
      const expensesData: Expense[] = await expensesRes.json();
      setSummary(summaryData);
      setExpenses(expensesData);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [userToken, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchPaymentsHistory = useCallback(async (pageToFetch: number) => {
    if (!userToken) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments?page=${pageToFetch}`, {
        headers: { 'Authorization': `Bearer ${userToken}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar o histórico de vendas.');
      const data = await response.json();
      setPayments(data.payments);
      setPaymentPage(data.page);
      setPaymentPages(data.pages);
    } catch (err: any) {
      showToast(err.message, 'danger');
    } finally {
      setLoadingHistory(false);
    }
  }, [userToken, showToast]);

  useEffect(() => {
    if (isHistoryVisible) {
      fetchPaymentsHistory(paymentPage);
    }
  }, [isHistoryVisible, paymentPage, fetchPaymentsHistory]);

  const toggleHistoryVisibility = () => setIsHistoryVisible(prev => !prev);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDescription) {
      showToast('Valor e observação são obrigatórios.', 'warning');
      return;
    }
    setIsSubmittingExpense(true);
    const expenseData = { amount: parseFloat(expenseAmount), description: expenseDescription };
    const method = editingExpense ? 'PUT' : 'POST';
    const url = editingExpense 
      ? `${import.meta.env.VITE_API_BASE_URL}/api/expenses/${editingExpense._id}`
      : `${import.meta.env.VITE_API_BASE_URL}/api/expenses`;
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }, body: JSON.stringify(expenseData) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Falha ao ${editingExpense ? 'atualizar' : 'adicionar'} despesa.`);
      }
      showToast(`Despesa ${editingExpense ? 'atualizada' : 'adicionada'} com sucesso!`, 'success');
      resetForm();
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'danger');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/expenses/${expenseId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${userToken}` } });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao excluir despesa.');
      }
      showToast('Despesa excluída com sucesso!', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'danger');
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseAmount(expense.amount.toString());
    setExpenseDescription(expense.description);
  };
  
  const resetForm = () => {
    setEditingExpense(null);
    setExpenseAmount('');
    setExpenseDescription('');
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  if (loading) return <div className="text-center mt-5"><h4>Carregando dados financeiros...</h4></div>;
  if (error) return <div className="container mt-4 alert alert-danger"><strong>Erro:</strong> {error}</div>;

  return (
    <div className="container mt-4">
      {/* === SEÇÃO 1: RESUMO DE LUCROS === */}
      <div className="d-flex align-items-center mb-4">
        <FontAwesomeIcon icon={faChartLine} size="2x" className="text-primary me-3" />
        <h2>Painel Financeiro</h2>
      </div>
      {summary && (
        <div className="row g-4">
          <div className="col-12">
            <div className={`card text-center text-white shadow-lg ${summary.total.net >= 0 ? 'bg-success' : 'bg-danger'}`}>
              <div className="card-header fs-5"><FontAwesomeIcon icon={faDollarSign} className="me-2" />Lucro Líquido Total</div>
              <div className="card-body">
                <h1 className="display-4 fw-bold">{formatCurrency(summary.total.net)}</h1>
                <p className="mb-0" style={{ opacity: 0.8 }}>(Ganhos: {formatCurrency(summary.total.gains)} - Perdas: {formatCurrency(summary.total.losses)})</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3"><div className="card text-center shadow-sm"><div className="card-header">Hoje</div><div className="card-body"><h4 className={`card-title fw-bold ${summary.today.net >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(summary.today.net)}</h4></div></div></div>
          <div className="col-md-6 col-lg-3"><div className="card text-center shadow-sm"><div className="card-header">Ontem</div><div className="card-body"><h4 className={`card-title fw-bold ${summary.yesterday.net >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(summary.yesterday.net)}</h4></div></div></div>
          <div className="col-md-6 col-lg-3"><div className="card text-center shadow-sm"><div className="card-header">Esta Semana</div><div className="card-body"><h4 className={`card-title fw-bold ${summary.thisWeek.net >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(summary.thisWeek.net)}</h4></div></div></div>
          <div className="col-md-6 col-lg-3"><div className="card text-center shadow-sm"><div className="card-header">Este Mês</div><div className="card-body"><h4 className={`card-title fw-bold ${summary.thisMonth.net >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(summary.thisMonth.net)}</h4></div></div></div>
        </div>
      )}

      <hr className="my-5" />

      {/* === SEÇÃO 2: GERENCIAMENTO DE PERDAS === */}
      <div className="row g-5">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header fs-5">
              <FontAwesomeIcon icon={editingExpense ? faEdit : faArrowDown} className={`me-2 ${editingExpense ? 'text-warning' : 'text-danger'}`} />
              {editingExpense ? 'Editar Despesa' : 'Registrar Perda / Despesa'}
            </div>
            <div className="card-body">
              <form onSubmit={handleExpenseSubmit}>
                <div className="mb-3">
                  <label htmlFor="expenseAmount" className="form-label">Valor (R$)</label>
                  <input type="number" step="0.01" className="form-control" id="expenseAmount" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Ex: 50,00" required disabled={isSubmittingExpense}/>
                </div>
                <div className="mb-3">
                  <label htmlFor="expenseDescription" className="form-label">Observação (Obrigatório)</label>
                  <textarea className="form-control" id="expenseDescription" rows={3} value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} placeholder="Ex: Compra de gelo, Pagamento de funcionário..." required disabled={isSubmittingExpense}></textarea>
                </div>
                <div className="d-grid">
                  <button type="submit" className={`btn ${editingExpense ? 'btn-warning' : 'btn-danger'}`} disabled={isSubmittingExpense}>
                    <FontAwesomeIcon icon={editingExpense ? faEdit : faPlus} className="me-2" />
                    {isSubmittingExpense ? 'Salvando...' : (editingExpense ? 'Salvar Alterações' : 'Registrar Perda')}
                  </button>
                </div>
              </form>
              {editingExpense && (
                <div className="d-grid mt-2">
                    <button className="btn btn-secondary" onClick={resetForm} disabled={isSubmittingExpense}>
                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                        Cancelar Edição
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <h4>Histórico de Perdas</h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr><th>Data</th><th>Observação</th><th className="text-end">Valor</th><th className="text-center">Ações</th></tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-muted">Nenhuma despesa registrada.</td></tr>
                ) : (
                  expenses.map(expense => (
                    <tr key={expense._id}>
                      <td>{new Date(expense.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>{expense.description}</td>
                      <td className="text-end text-danger">({formatCurrency(expense.amount)})</td>
                      <td className="text-center">
                          <button className="btn btn-warning btn-sm me-2" title="Editar" onClick={() => handleEditClick(expense)}><FontAwesomeIcon icon={faEdit} /></button>
                          <button className="btn btn-danger btn-sm" title="Excluir" onClick={() => handleDeleteExpense(expense._id)}><FontAwesomeIcon icon={faTrash} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      {/* === SEÇÃO 3: HISTÓRICO DE VENDAS (GANHOS) === */}
      <div className="card shadow-sm">
        <div className="card-header fs-5 p-0">
          <button className="btn btn-light w-100 text-start d-flex justify-content-between align-items-center p-3" onClick={toggleHistoryVisibility}>
            <span className="fw-bold"><FontAwesomeIcon icon={faHistory} className="me-2 text-info" />Histórico de Vendas (Ganhos)</span>
            <FontAwesomeIcon icon={isHistoryVisible ? faChevronUp : faChevronDown} />
          </button>
        </div>
        <div className={`collapse ${isHistoryVisible ? 'show' : ''}`}>
          <div className="card-body">
            {loadingHistory ? (
              <div className="text-center p-3">Carregando histórico...</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-sm table-striped table-hover">
                    <thead className="table-light">
                      <tr><th>Data</th><th>Cliente</th><th>Método</th><th className="text-end">Valor</th></tr>
                    </thead>
                    <tbody>
                      {payments.length > 0 ? payments.map(payment => (
                        <tr key={payment._id}>
                          <td>{new Date(payment.createdAt).toLocaleString('pt-BR')}</td>
                          <td>{payment.customer?.name || 'N/A'}</td>
                          <td><span className={`badge ${payment.paymentMethod === 'Dinheiro' ? 'bg-success-subtle text-success-emphasis' : 'bg-primary-subtle text-primary-emphasis'}`}>{payment.paymentMethod}</span></td>
                          <td className="text-end fw-bold text-success">+{formatCurrency(payment.amount)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="text-center text-muted">Nenhuma venda encontrada no histórico.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination pages={paymentPages} page={paymentPage} onPageChange={setPaymentPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfitPage;
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faDollarSign, faReceipt, faUsersSlash } from '@fortawesome/free-solid-svg-icons'; // Ícones adicionais

// *** DEFINIÇÃO DE INTERFACES NECESSÁRIAS AQUI (Workaround) ***
interface Customer {
  _id: string;
  name: string;
}

interface Debt {
  _id: string;
  customer: Customer; // Cliente populado
  amount: number;
  debtDate: string;
}

interface TopSellingItem {
  productId: string;
  name: string;
  totalSold: number;
}

// Para agrupar débitos altos por cliente no Dashboard
interface GroupedHighDebt {
    customer: Customer;
    totalAmountOver100: number; // A soma das dívidas desse cliente
}

// NOVA INTERFACE: Para os fiados de hoje detalhados
interface TodayUnpaidDebtItem {
    customerId: string;
    customerName: string;
    totalDebtToday: number;
}
// ************************************************************

const DashboardPage: React.FC = () => {
  const { username, userRole, userToken, showToast } = useAppContext();
  const [profitYesterday, setProfitYesterday] = useState<number | null>(null); // Manter se a rota still existir
  const [todayProfit, setTodayProfit] = useState<number | null>(null);
  const [todayUnpaidDebtsList, setTodayUnpaidDebtsList] = useState<TodayUnpaidDebtItem[]>([]); // <<-- MUDANÇA AQUI
  const [groupedHighDebts, setGroupedHighDebts] = useState<GroupedHighDebt[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [errorReports, setErrorReports] = useState<string | null>(null);

  useEffect(() => {
    if (userToken) {
      fetchReports();
    }
  }, [userToken]);

  const fetchReports = async () => {
    setLoadingReports(true);
    setErrorReports(null);
    try {
      const [yesterdayProfitRes, todayProfitRes, todayUnpaidDebtsRes, highDebtsRes, topSellingRes] = await Promise.all([ // <<-- MUDANÇA AQUI (nome da variável)
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/daily-profit`, {
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/today-profit`, {
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/today-unpaid-debts`, { // <<-- MUDANÇA AQUI (nova rota)
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/high-debts`, {
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/top-selling-items`, {
          headers: { Authorization: `Bearer ${userToken}` }
        })
      ]);

      if (!yesterdayProfitRes.ok) throw new Error('Falha ao buscar lucro do dia anterior.');
      if (!todayProfitRes.ok) throw new Error('Falha ao buscar lucro de hoje.');
      if (!todayUnpaidDebtsRes.ok) throw new Error('Falha ao buscar fiados de hoje.'); // <<-- VERIFICAÇÃO DE ERRO
      if (!highDebtsRes.ok) throw new Error('Falha ao buscar débitos altos.');
      if (!topSellingRes.ok) throw new Error('Falha ao buscar itens mais vendidos.');

      const yesterdayProfitData = await yesterdayProfitRes.json();
      const todayProfitData = await todayProfitRes.json();
      const todayUnpaidDebtsListData: TodayUnpaidDebtItem[] = await todayUnpaidDebtsRes.json(); // <<-- NOVO DADO
      const highDebtsData: Debt[] = await highDebtsRes.json();

      const topSellingData = await topSellingRes.json();

      setProfitYesterday(yesterdayProfitData.profitYesterday);
      setTodayProfit(todayProfitData.todayProfit);
      setTodayUnpaidDebtsList(todayUnpaidDebtsListData); // <<-- ATUALIZA ESTADO
      setTopSellingItems(topSellingData);

      // --- Lógica para Agrupar Débitos Altos por Cliente ---
      const highDebtsMap = new Map<string, GroupedHighDebt>();

      highDebtsData.forEach(debt => {
        if (!debt.customer || !debt.customer._id) {
            console.warn('Dívida alta ignorada devido a cliente nulo ou sem _id:', debt);
            return; 
        }
        const customerId = debt.customer._id;
        if (!highDebtsMap.has(customerId)) {
          highDebtsMap.set(customerId, {
            customer: debt.customer,
            totalAmountOver100: 0
          });
        }
        const grouped = highDebtsMap.get(customerId)!;
        grouped.totalAmountOver100 += debt.amount;
      });

      const filteredGroupedHighDebts = Array.from(highDebtsMap.values()).filter(
        groupedDebt => groupedDebt.totalAmountOver100 > 100
      );
      setGroupedHighDebts(filteredGroupedHighDebts);

    } catch (err: any) {
      setErrorReports(err.message || 'Erro ao carregar relatórios.');
      console.error('Erro ao carregar relatórios:', err);
      showToast(err.message || 'Erro ao carregar relatórios.', 'danger');
    } finally {
      setLoadingReports(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="alert alert-success" role="alert">
        <h4 className="alert-heading">Bem-vindo, {username}!</h4>
        <hr />
        <p className="mb-0">Você está logado como **{userRole}**.</p>
      </div>

      <h3 className="mt-5 mb-4">Relatórios Rápidos</h3>

      {loadingReports ? (
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" />
          <p className="mt-2">Carregando relatórios...</p>
        </div>
      ) : errorReports ? (
        <div className="alert alert-danger">{errorReports}</div>
      ) : (
        <div className="row g-4">
          {/* Lucro de Hoje */}
          <div className="col-md-4">
            <div className="card text-center h-100">
              <div className="card-body">
                <h5 className="card-title">Lucro de Hoje</h5>
                <p className="card-text fs-3 text-success">
                  <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                  {todayProfit !== null ? todayProfit.toFixed(2).replace('.', ',') : '0,00'}
                </p>
              </div>
            </div>
          </div>

          {/* Débitos Maiores que R$ 100 (Sem mudanças de dados aqui, apenas a lógica já implementada) */}
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Débitos Pendentes &gt; R$ 100</h5>
                {groupedHighDebts.length === 0 ? (
                  <p className="card-text text-muted">Nenhum débito pendente acima de R$100.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {groupedHighDebts.map(groupedHighDebt => (
                      <li key={groupedHighDebt.customer._id} className="list-group-item d-flex justify-content-between align-items-center">
                        {groupedHighDebt.customer ? groupedHighDebt.customer.name : 'Cliente Desconhecido'}
                        <span className="badge bg-danger rounded-pill">
                          R$ {groupedHighDebt.totalAmountOver100.toFixed(2).replace('.', ',')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Fiados de Hoje (Detalhado) */}
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Fiados de Hoje</h5>
                {todayUnpaidDebtsList.length === 0 ? ( // <<-- MUDANÇA AQUI
                  <p className="card-text text-muted">Nenhum fiado registrado hoje.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {todayUnpaidDebtsList.map(item => ( // <<-- MUDANÇA AQUI
                      <li key={item.customerId} className="list-group-item d-flex justify-content-between align-items-center">
                        {item.customerName}
                        <span className="badge bg-warning text-dark rounded-pill">
                          R$ {item.totalDebtToday.toFixed(2).replace('.', ',')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Top 3 Itens Mais Vendidos (Sem mudanças neste card) */}
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Top 3 Itens Mais Vendidos</h5>
                {topSellingItems.length === 0 ? (
                  <p className="card-text text-muted">Nenhum item vendido ainda.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {topSellingItems.map((item, index) => (
                      <li key={item.productId} className="list-group-item d-flex justify-content-between align-items-center">
                        {index + 1}. {item.name}
                        <span className="badge bg-primary rounded-pill">
                          {item.totalSold} vendidos
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
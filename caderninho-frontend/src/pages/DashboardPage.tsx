import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'; // Ícone de spinner para carregamento

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

// NOVA INTERFACE: Para agrupar débitos altos por cliente no Dashboard
interface GroupedHighDebt {
    customer: Customer;
    totalAmountOver100: number; // A soma das dívidas desse cliente
}
// ************************************************************

const DashboardPage: React.FC = () => {
  const { username, userRole, userToken, showToast } = useAppContext();
  const [profitYesterday, setProfitYesterday] = useState<number | null>(null);
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
      const [profitRes, highDebtsRes, topSellingRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/daily-profit`, {
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/high-debts`, { // Agora busca TODAS as dívidas pendentes
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/top-selling-items`, {
          headers: { Authorization: `Bearer ${userToken}` }
        })
      ]);

      if (!profitRes.ok) throw new Error('Falha ao buscar lucro do dia anterior.');
      if (!highDebtsRes.ok) throw new Error('Falha ao buscar débitos altos.');
      if (!topSellingRes.ok) throw new Error('Falha ao buscar itens mais vendidos.');

      const profitData = await profitRes.json();
      const highDebtsData: Debt[] = await highDebtsRes.json(); // Pega TODAS as dívidas individuais

      const topSellingData = await topSellingRes.json();

      setProfitYesterday(profitData.profitYesterday);
      setTopSellingItems(topSellingData);

      // --- Lógica para Agrupar Dívidas e DEPOIS Filtrar por Total > R$ 100 ---
      const highDebtsMap = new Map<string, GroupedHighDebt>();

      highDebtsData.forEach(debt => {
        if (!debt.customer || !debt.customer._id) { // Proteção contra cliente nulo
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
        grouped.totalAmountOver100 += debt.amount; // Soma TODAS as dívidas do cliente
      });

      // FILTRA APENAS OS CLIENTES CUJA DÍVIDA TOTAL É MAIOR QUE R$ 100
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
          {/* Lucro do Dia Anterior */}
          <div className="col-md-4">
            <div className="card text-center h-100">
              <div className="card-body">
                <h5 className="card-title">Lucro do Dia Anterior</h5>
                <p className="card-text fs-3 text-success">
                  R$ {profitYesterday !== null ? profitYesterday.toFixed(2).replace('.', ',') : '0,00'}
                </p>
              </div>
            </div>
          </div>

          {/* Débitos Maiores que R$ 100 */}
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

          {/* Top 3 Itens Mais Vendidos */}
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
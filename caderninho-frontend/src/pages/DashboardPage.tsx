import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

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
// ************************************************************

const DashboardPage: React.FC = () => {
  const { username, userRole, userToken } = useAppContext();
  const [profitYesterday, setProfitYesterday] = useState<number | null>(null);
  const [highDebts, setHighDebts] = useState<Debt[]>([]);
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
        fetch('http://localhost:4000/api/reports/daily-profit', {
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch('http://4000/api/reports/high-debts', { // Corrigindo para 4000
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch('http://localhost:4000/api/reports/top-selling-items', {
          headers: { Authorization: `Bearer ${userToken}` }
        })
      ]);

      if (!profitRes.ok) throw new Error('Falha ao buscar lucro do dia anterior.');
      if (!highDebtsRes.ok) throw new Error('Falha ao buscar débitos altos.');
      if (!topSellingRes.ok) throw new Error('Falha ao buscar itens mais vendidos.');

      const profitData = await profitRes.json();
      const highDebtsData = await highDebtsRes.json();
      const topSellingData = await topSellingRes.json();

      setProfitYesterday(profitData.profitYesterday);
      setHighDebts(highDebtsData);
      setTopSellingItems(topSellingData);

    } catch (err: any) {
      setErrorReports(err.message || 'Erro ao carregar relatórios.');
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="alert alert-success" role="alert">
        <h4 className="alert-heading">Bem-vindo, {username}!</h4>
        <p className="mb-0">Você está logado como **{userRole}**.</p>
        <hr />
        <p className="mb-0">Este é o painel de controle do seu Caderninho.</p>
      </div>

      <h3 className="mt-5 mb-4">Relatórios Rápidos</h3>

      {loadingReports ? (
        <div className="text-center">Carregando relatórios...</div>
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
                {highDebts.length === 0 ? (
                  <p className="card-text text-muted">Nenhum débito pendente acima de R$100.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {highDebts.map(debt => (
                      <li key={debt._id} className="list-group-item d-flex justify-content-between align-items-center">
                        {debt.customer ? debt.customer.name : 'Cliente Desconhecido'}
                        <span className="badge bg-danger rounded-pill">
                          R$ {debt.amount.toFixed(2).replace('.', ',')}
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
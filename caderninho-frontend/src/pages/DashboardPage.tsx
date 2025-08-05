// CAMINHO: src/pages/DashboardPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faExclamationTriangle, faTags } from '@fortawesome/free-solid-svg-icons';

// Interfaces para os dados que esperamos
interface ProfitSummary { today: number; yesterday: number; }
interface HighDebt { customerId: string | number; customerName: string; totalDebt: number; }
interface TopItem { name: string; totalSold: number; }

interface DashboardData {
  profitSummary: ProfitSummary;
  highDebts: HighDebt[];
  topSellingItems: TopItem[];
}

const DashboardPage: React.FC = () => {
  const { userToken, showToast } = useAppContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const config = { headers: { 'Authorization': `Bearer ${userToken}` } };
      
      // Fazemos todas as chamadas à API em paralelo para mais velocidade
      const [profitRes, highDebtsRes, topItemsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/profit-summary`, config),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/high-debts`, config),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/top-selling-items`, config)
      ]);

      if (!profitRes.ok || !highDebtsRes.ok || !topItemsRes.ok) {
        throw new Error('Falha ao carregar um ou mais relatórios do dashboard.');
      }

      const profitSummary = await profitRes.json();
      const highDebts = await highDebtsRes.json();
      const topSellingItems = await topItemsRes.json();
      
      setData({ profitSummary, highDebts, topSellingItems });

    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [userToken, showToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  if (loading) return <div className="text-center mt-5"><h4>Carregando Dashboard...</h4></div>;
  if (error) return <div className="container mt-4 alert alert-danger"><strong>Erro:</strong> {error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row g-4">
        {/* Coluna da Esquerda: Lucros */}
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header fs-5"><FontAwesomeIcon icon={faChartLine} className="me-2 text-success" />Resumo de Lucros</div>
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <span>Lucro de Hoje</span>
                <span className="fw-bold fs-5">{formatCurrency(data?.profitSummary.today || 0)}</span>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <span>Lucro de Ontem</span>
                <span className="fw-bold">{formatCurrency(data?.profitSummary.yesterday || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coluna do Meio: Maiores Devedores */}
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header fs-5"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-danger" />Maiores Fiados (Acima de R$ 100)</div>
            {data?.highDebts && data.highDebts.length > 0 ? (
              <ul className="list-group list-group-flush">
                {data.highDebts.map(debt => (
                  <li key={debt.customerId} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{debt.customerName}</span>
                    <span className="badge bg-danger rounded-pill">{formatCurrency(debt.totalDebt)}</span>
                  </li>
                ))}
              </ul>
            ) : (<div className="card-body text-muted">Nenhum cliente com dívida alta.</div>)}
          </div>
        </div>

        {/* Coluna da Direita: Itens mais vendidos */}
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header fs-5"><FontAwesomeIcon icon={faTags} className="me-2 text-primary" />Top 3 Itens Mais Vendidos</div>
            {data?.topSellingItems && data.topSellingItems.length > 0 ? (
              <ul className="list-group list-group-flush">
                {data.topSellingItems.map(item => (
                  <li key={item.name} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{item.name}</span>
                    <span className="badge bg-primary rounded-pill">{item.totalSold} vendidos</span>
                  </li>
                ))}
              </ul>
            ) : (<div className="card-body text-muted">Nenhuma venda registrada ainda.</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
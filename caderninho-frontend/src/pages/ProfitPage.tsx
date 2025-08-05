// CAMINHO: src/pages/ProfitPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faChartLine, 
  faCalendarDay, 
  faCalendarWeek, 
  faCalendarAlt 
} from '@fortawesome/free-solid-svg-icons';

// Interface para definir a estrutura dos dados que esperamos do backend
interface ProfitSummary {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

const ProfitPage: React.FC = () => {
  const { userToken, showToast } = useAppContext();
  const [summary, setSummary] = useState<ProfitSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfitSummary = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/profit-summary`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar o resumo de lucros.');
      }
      
      const data: ProfitSummary = await response.json();
      setSummary(data);

    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [userToken, showToast]);

  useEffect(() => {
    fetchProfitSummary();
  }, [fetchProfitSummary]);

  // Função para formatar os números como moeda brasileira (BRL)
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  if (loading) {
    return <div className="text-center mt-5"><h4>Carregando resumo de lucros...</h4></div>;
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger"><strong>Erro:</strong> {error}</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-4">
        <FontAwesomeIcon icon={faChartLine} size="2x" className="text-primary me-3" />
        <h2>Resumo de Lucros</h2>
      </div>

      {summary && (
        <div className="row g-4">
          {/* Card de Lucro Total */}
          <div className="col-12">
            <div className="card text-center text-white bg-primary shadow-lg">
              <div className="card-header fs-5">
                <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                Lucro Total (Desde o Início)
              </div>
              <div className="card-body">
                <h1 className="display-4 fw-bold">{formatCurrency(summary.total)}</h1>
              </div>
            </div>
          </div>

          {/* Cards de Períodos */}
          <div className="col-md-6 col-lg-3">
            <div className="card text-center shadow-sm">
              <div className="card-header">
                <FontAwesomeIcon icon={faCalendarDay} className="me-2" />
                Hoje
              </div>
              <div className="card-body">
                <h4 className="card-title fw-bold">{formatCurrency(summary.today)}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card text-center shadow-sm">
              <div className="card-header">
                <FontAwesomeIcon icon={faCalendarDay} className="me-2 text-muted" />
                Ontem
              </div>
              <div className="card-body">
                <h4 className="card-title fw-bold">{formatCurrency(summary.yesterday)}</h4>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <div className="card text-center shadow-sm">
              <div className="card-header">
                <FontAwesomeIcon icon={faCalendarWeek} className="me-2" />
                Esta Semana
              </div>
              <div className="card-body">
                <h4 className="card-title fw-bold">{formatCurrency(summary.thisWeek)}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card text-center shadow-sm">
              <div className="card-header">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Este Mês
              </div>
              <div className="card-body">
                <h4 className="card-title fw-bold">{formatCurrency(summary.thisMonth)}</h4>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfitPage;
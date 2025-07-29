import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faDollarSign } from '@fortawesome/free-solid-svg-icons'; // Ícones para spinner e cifrão

interface TotalProfitReport {
  totalProfit: number;
}

const ProfitPage: React.FC = () => {
  const { userToken, userRole, showToast } = useAppContext();
  const [totalProfit, setTotalProfit] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToken && userRole === 'admin') { // Apenas admin pode buscar
      fetchTotalProfit();
    } else if (userRole !== 'admin') {
      setLoading(false);
      setError('Acesso negado. Apenas administradores podem ver o lucro.');
      showToast('Acesso negado. Apenas administradores podem ver o lucro.', 'danger');
    }
  }, [userToken, userRole]);

  const fetchTotalProfit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/total-profit`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar lucro total.');
      }
      const data: TotalProfitReport = await response.json();
      setTotalProfit(data.totalProfit);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar lucro total.');
      console.error('Erro ao carregar lucro total:', err);
      showToast(err.message || 'Erro ao carregar lucro total.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 text-center">
      <h2 className="mb-4">Lucro Total</h2>

      {loading ? (
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" />
          <p className="mt-2">Calculando lucro...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card mx-auto" style={{ maxWidth: '400px' }}>
          <div className="card-body">
            <h5 className="card-title">Valor Bruto Recebido (Pedidos Pagos)</h5>
            <p className="card-text fs-1 text-success">
              <FontAwesomeIcon icon={faDollarSign} className="me-2" />
              {totalProfit !== null ? totalProfit.toFixed(2).replace('.', ',') : '0,00'}
            </p>
            <p className="text-muted small">Este valor representa a soma de todos os 'Valores Pagos' de pedidos marcados como pagos.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitPage;
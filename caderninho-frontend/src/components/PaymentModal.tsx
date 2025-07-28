import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap'; // Importa a classe Modal do Bootstrap JS
import { useAppContext } from '../context/AppContext'; // Para showToast e userToken

// Definimos a interface para o Pedido, com os campos necessários para o modal
// (Poderíamos importar Order da OrdersPage, mas para evitar erros, definimos inline)
interface Order {
  _id: string;
  customer?: { _id: string; name: string; }; // Apenas o necessário
  totalAmount: number;
  isPaid: boolean;
  // Adicionamos os campos de pagamento aqui para compatibilidade
  paidAmount?: number;
  paymentMethod?: string;
  paymentDate?: Date;
}

interface PaymentModalProps {
  order: Order | null; // O pedido que está sendo pago
  show: boolean; // Para controlar a visibilidade do modal
  onClose: () => void; // Callback para fechar o modal
  onPaymentSuccess: () => void; // Callback após pagamento bem-sucedido
}

const PaymentModal: React.FC<PaymentModalProps> = ({ order, show, onClose, onPaymentSuccess }) => {
  const { userToken, showToast } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const bsModalInstance = useRef<Modal | null>(null); // Ref para a instância do Bootstrap Modal

  const [valorPago, setValorPago] = useState<string>('');
  const [metodoPagamento, setMetodoPagamento] = useState<string>('Dinheiro');
  const [troco, setTroco] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para sincronizar a visibilidade do modal e gerenciar a instância Bootstrap Modal
  useEffect(() => {
    if (!modalRef.current) return;

    // Cria a instância do Modal Bootstrap apenas UMA VEZ
    if (!bsModalInstance.current) {
      bsModalInstance.current = new Modal(modalRef.current, { backdrop: 'static', keyboard: false });
      // Adiciona o listener para quando o modal é realmente fechado pelo Bootstrap
      // Este listener vai chamar o onClose da prop, que é quem atualiza o estado 'showPaymentModal' na OrdersPage
      modalRef.current.addEventListener('hidden.bs.modal', onClose);
    }

    // Controla a exibição/ocultação do modal com base na prop 'show'
    if (show) {
      bsModalInstance.current.show();
      // Resetar estados quando o modal é aberto
      setValorPago(order?.totalAmount.toFixed(2) || ''); // Preenche com o total do pedido (com ponto)
      setMetodoPagamento('Dinheiro');
      setTroco(0);
      setError(null);
    } else {
      // Usa a instância existente para esconder, se ela existir e o modal estiver visível
      // Verifica se o modalRef.current tem a classe 'show' para saber se está visível antes de esconder
      if (bsModalInstance.current && modalRef.current.classList.contains('show')) {
        bsModalInstance.current.hide();
      }
    }

    // Cleanup: Remove o listener e destrói a instância do modal quando o componente é desmontado
    return () => {
      if (modalRef.current && bsModalInstance.current) {
        modalRef.current.removeEventListener('hidden.bs.modal', onClose);
        bsModalInstance.current.dispose(); // Destrói a instância para evitar vazamentos de memória
        bsModalInstance.current = null;
      }
    };
  }, [show, order, onClose]); // Dependências do useEffect

  // Efeito para calcular o troco
  useEffect(() => {
    if (metodoPagamento === 'Dinheiro' && order) {
      const pago = parseFloat(valorPago.replace(',', '.')); // Converte a vírgula do input para ponto
      const total = order.totalAmount;
      if (!isNaN(pago) && pago >= total) {
        setTroco(pago - total);
      } else {
        setTroco(0);
      }
    } else {
      setTroco(0);
    }
  }, [valorPago, metodoPagamento, order]);


  const handleConfirmPayment = async () => {
    if (!order || !userToken) {
      setError('Pedido ou token inválido.');
      return;
    }

    if (metodoPagamento === 'Dinheiro') {
      const pago = parseFloat(valorPago.replace(',', '.'));
      if (isNaN(pago) || pago < order.totalAmount) {
        setError('Para pagamento em Dinheiro, o valor pago deve ser igual ou maior que o total do pedido.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${order._id}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          paidAmount: parseFloat(valorPago.replace(',', '.')), // Garante que o valor enviado seja número com ponto
          paymentMethod: metodoPagamento,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao registrar pagamento.');
      }

      showToast('Pagamento registrado com sucesso!', 'success');
      onPaymentSuccess(); // Notifica a página Orders que o pagamento foi feito

      // Fechar o modal explicitamente via API do Bootstrap APÓS o sucesso
      if (bsModalInstance.current) {
        bsModalInstance.current.hide();
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao registrar pagamento.');
      showToast(err.message || 'Erro ao registrar pagamento.', 'danger');
      console.error('Erro ao registrar pagamento:', err);
    } finally {
      setLoading(false);
    }
  };

  // Não renderiza o modal se não houver pedido ou se o modal não deve ser mostrado
  if (!order) return null; 

  return (
    // Atenção: As classes 'modal fade' e o id são importantes para o Bootstrap
    <div className="modal fade" id="paymentModal" tabIndex={-1} aria-labelledby="paymentModalLabel" aria-hidden="true" ref={modalRef}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="paymentModalLabel">Registrar Pagamento do Pedido</h5>
            {/* O botão 'btn-close' do Bootstrap tem data-bs-dismiss="modal" que o fecha */}
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <p>Cliente: <strong>{order.customer?.name || 'Desconhecido'}</strong></p>
            <p>Total do Pedido: <strong className="text-primary fs-4">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</strong></p>

            <div className="mb-3">
              <label htmlFor="valorPago" className="form-label">Valor Recebido (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                id="valorPago"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                disabled={loading || metodoPagamento === 'Cartão'} // Desabilita se for cartão
              />
            </div>

            <div className="mb-3">
              <label className="form-label d-block">Método de Pagamento</label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="metodoPagamento"
                  id="radioDinheiro"
                  value="Dinheiro"
                  checked={metodoPagamento === 'Dinheiro'}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="radioDinheiro">Dinheiro</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="metodoPagamento"
                  id="radioCartao"
                  value="Cartão"
                  checked={metodoPagamento === 'Cartão'}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="radioCartao">Cartão</label>
              </div>
            </div>

            {metodoPagamento === 'Dinheiro' && (
              <div className="alert alert-info mt-3">
                Troco: <strong className="fs-5">R$ {troco.toFixed(2).replace('.', ',')}</strong>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmPayment}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
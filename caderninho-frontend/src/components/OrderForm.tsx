import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

// *** DEFINIÇÃO DE INTERFACES NECESSÁRIAS AQUI (Workaround) ***
// Interfaces minimas para seleção
interface Product {
  _id: string;
  name: string;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
}

// Interface para um item de pedido no formulário (inclui quantidade temporária)
interface FormOrderItem {
    productId: string;
    quantity: number;
    name?: string; // Nome para exibição na lista de seleção
    price?: number; // Preço para exibição na lista de seleção
}
// **************************************************************

interface OrderFormProps {
  order?: Order | null; 
  onSave: () => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onSave, onCancel }) => {
  const { userToken } = useAppContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<FormOrderItem[]>([]); // Produtos selecionados para o pedido
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchCustomersAndProducts();
  }, [userToken]);

  const [originalOrderItems, setOriginalOrderItems] = useState<FormOrderItem[]>([]); // Para rastrear itens originais

useEffect(() => {
    if (order) {
        setSelectedCustomer(order.customer._id); // Preenche o cliente
        // Mapeia os itens do pedido existente para o formato FormOrderItem
        const mappedItems: FormOrderItem[] = order.items.map(item => ({
            productId: item.product._id,
            quantity: item.quantity,
            name: item.product.name,
            price: item.product.price
        }));
        setSelectedProducts(mappedItems);
        setOriginalOrderItems(mappedItems); // Guarda para lógica de diff (se necessário)
    } else {
        // Se não é edição, limpa o formulário
        setSelectedCustomer('');
        setSelectedProducts([]);
        setOriginalOrderItems([]);
    }
    setError(null);
}, [order]);

  const fetchCustomersAndProducts = async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers`, {
          headers: { Authorization: `Bearer ${userToken}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`, {
          headers: { Authorization: `Bearer ${userToken}` }
        })
      ]);

      if (!customersResponse.ok) throw new Error('Falha ao buscar clientes.');
      if (!productsResponse.ok) throw new Error('Falha ao buscar produtos.');

      const customersData: Customer[] = await customersResponse.json();
      const productsData: Product[] = await productsResponse.json();

      setCustomers(customersData);
      setProducts(productsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados para o pedido.');
      console.error('Erro ao carregar dados para o pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductToOrder = (product: Product) => {
    setSelectedProducts(prevSelected => {
      const existingItem = prevSelected.find(item => item.productId === product._id);
      if (existingItem) {
        // Se o produto já está na lista, aumenta a quantidade
        return prevSelected.map(item =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Adiciona um novo item
        return [...prevSelected, { productId: product._id, quantity: 1, name: product.name, price: product.price }];
      }
    });
  };

  const handleRemoveProductFromOrder = (productId: string) => {
    setSelectedProducts(prevSelected => prevSelected.filter(item => item.productId !== productId));
  };

  const handleChangeProductQuantity = (productId: string, newQuantity: number) => {
    setSelectedProducts(prevSelected => {
      if (newQuantity <= 0) {
        return prevSelected.filter(item => item.productId !== productId); // Remove se quantidade for 0 ou menos
      }
      return prevSelected.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) {
      setError('Você precisa estar logado para criar pedidos.');
      return;
    }
    if (!selectedCustomer) {
      setError('Por favor, selecione um cliente.');
      return;
    }
    if (selectedProducts.length === 0) {
      setError('Por favor, adicione pelo menos um produto ao pedido.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const orderData = {
      customerId: selectedCustomer,
      items: selectedProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
      // isPaid: false por padrão no backend
    };

    try {
      const url = order ? `${import.meta.env.VITE_API_BASE_URL}/api/orders/${order._id}` : `${import.meta.env.VITE_API_BASE_URL}/api/orders`;
      const response = await fetch(url, {
        method: order ? 'PUT' : 'POST', // Usa PUT se for edição, POST se for novo pedido
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar pedido.');
      }

      alert('Pedido criado com sucesso!');
      onSave(); // Notifica a página pai para fechar o formulário e recarregar a lista
    } catch (err: any) {
      setError(err.message || 'Erro ao criar pedido.');
      console.error('Erro ao criar pedido:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => {
      const productDetail = products.find(p => p._id === item.productId);
      return sum + (productDetail ? productDetail.price * item.quantity : 0);
    }, 0);
  };


  if (loading) return <div className="text-center mt-5">Carregando dados para o formulário...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="card p-4 mb-4">
      <h4 className="mb-3">{order ? 'Editar Pedido' : 'Criar Novo Pedido'}</h4>
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Seleção de Cliente */}
        <div className="mb-3">
          <label htmlFor="customerSelect" className="form-label">Selecionar Cliente</label>
          <select
            id="customerSelect"
            className="form-select"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            required
            disabled={submitting}
          >
            <option value="">-- Selecione um Cliente --</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Adição de Produtos */}
        <h5 className="mt-4 mb-3">Adicionar Produtos</h5>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 mb-4">
          {products.length === 0 ? (
            <p className="text-muted ms-3">Nenhum produto cadastrado para adicionar.</p>
          ) : (
            products.map(product => (
              <div key={product._id} className="col">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title">{product.name}</h6>
                    <p className="card-text text-muted mb-auto">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => handleAddProductToOrder(product)}
                      disabled={submitting}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Produtos no Pedido */}
        <h5 className="mt-4 mb-3">Produtos no Pedido</h5>
        {selectedProducts.length === 0 ? (
          <div className="alert alert-warning">Nenhum produto adicionado ao pedido ainda.</div>
        ) : (
          <ul className="list-group mb-3">
            {selectedProducts.map(item => (
              <li key={item.productId} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {item.name} - R$ {item.price ? (item.price * item.quantity).toFixed(2).replace('.', ',') : 'N/A'}
                  <div className="text-muted small">R$ {item.price ? item.price.toFixed(2).replace('.', ',') : 'N/A'} (un.)</div>
                </div>
                <div className="d-flex align-items-center">
                  <input
                    type="number"
                    min="1"
                    className="form-control text-center me-2"
                    style={{ width: '80px' }}
                    value={item.quantity}
                    onChange={(e) => handleChangeProductQuantity(item.productId, parseInt(e.target.value))}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveProductFromOrder(item.productId)}
                    disabled={submitting}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h4 className="text-end mt-4">Total: R$ {calculateTotal().toFixed(2).replace('.', ',')}</h4>

        {/* Botões de Ação */}
        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-success me-2" disabled={submitting}>
            {submitting ? 'Criando Pedido...' : 'Salvar Pedido'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
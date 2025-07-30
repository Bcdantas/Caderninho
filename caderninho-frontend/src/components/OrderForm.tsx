// CAMINHO: src/components/OrderForm.tsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

// --- Interfaces ---
interface Product {
  _id: string;
  name: string;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
}

interface FormOrderItem {
    productId: string;
    quantity: number;
    name?: string;
    price?: number;
}

interface Order {
  _id: string;
  customer: Customer;
  items: Array<{
    product: Product;
    quantity: number;
  }>;
}

interface OrderFormProps {
  order?: Order | null; 
  onSave: () => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onSave, onCancel }) => {
  const { userToken } = useAppContext();
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<FormOrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  
  useEffect(() => {
    fetchCustomersAndProducts();
  }, [userToken]);

  useEffect(() => {
    if (order) {
        setSelectedCustomer(order.customer._id);
        const mappedItems: FormOrderItem[] = order.items.map(item => ({
            productId: item.product._id,
            quantity: item.quantity,
            name: item.product.name,
            price: item.product.price
        }));
        setSelectedProducts(mappedItems);
    } else {
        setSelectedCustomer('');
        setSelectedProducts([]);
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
      setAllCustomers(customersData);
      setAllProducts(productsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados para o pedido.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddProductToOrder = (product: Product) => {
    setSelectedProducts(prevSelected => {
      const existingItem = prevSelected.find(item => item.productId === product._id);
      if (existingItem) {
        return prevSelected.map(item =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
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
        return prevSelected.filter(item => item.productId !== productId);
      }
      return prevSelected.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    };
    try {
      const url = order ? `${import.meta.env.VITE_API_BASE_URL}/api/orders/${order._id}` : `${import.meta.env.VITE_API_BASE_URL}/api/orders`;
      const response = await fetch(url, {
        method: order ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar pedido.');
      }
      alert(`Pedido ${order ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => {
      return sum + ((item.price || 0) * item.quantity);
    }, 0);
  };
  
  const filteredCustomers = allCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // =========================================================================
  // ### NOVA FUNCIONALIDADE ADICIONADA AQUI ###
  // Este useEffect "assiste" a lista de clientes filtrados.
  useEffect(() => {
    // A condição é: O usuário digitou algo E a busca resultou em apenas UM cliente
    if (customerSearch && filteredCustomers.length === 1) {
      // Se a condição for verdadeira, seleciona automaticamente esse cliente.
      setSelectedCustomer(filteredCustomers[0]._id);
    }
  }, [filteredCustomers, customerSearch]); // Roda sempre que a lista ou o termo de busca mudam.
  // =========================================================================

  if (loading) return <div className="text-center mt-5">Carregando dados para o formulário...</div>;

  return (
    <div className="card p-4 mb-4">
      <h4 className="mb-3">{order ? 'Editar Pedido' : 'Criar Novo Pedido'}</h4>
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Seção de Clientes */}
        <div className="mb-3">
            <label htmlFor="customerSearch" className="form-label fw-bold">Buscar Cliente</label>
            <input
                type="text"
                id="customerSearch"
                className="form-control mb-2"
                placeholder="Digite o nome do cliente para filtrar..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
            />
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
                {filteredCustomers.map(customer => (
                <option key={customer._id} value={customer._id}>
                    {customer.name}
                </option>
                ))}
            </select>
            {filteredCustomers.length === 0 && customerSearch && <div className="form-text text-warning">Nenhum cliente encontrado com este nome.</div>}
        </div>


        {/* Seção de Produtos */}
        <h5 className="mt-4 mb-3">Adicionar Produtos</h5>
        <div className="mb-3">
            <label htmlFor="productSearch" className="form-label fw-bold">Buscar Produto</label>
            <input
                type="text"
                id="productSearch"
                className="form-control"
                placeholder="Digite o nome do produto para filtrar..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
            />
        </div>
        
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 mb-4">
            {filteredProducts.length === 0 ? (
                <p className="text-muted ms-3">{productSearch ? 'Nenhum produto encontrado com este nome.' : 'Nenhum produto cadastrado.'}</p>
            ) : (
                filteredProducts.map(product => (
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

        {/* Seção de Produtos no Pedido */}
        <h5 className="mt-4 mb-3">Produtos no Pedido</h5>
        {selectedProducts.length === 0 ? (
          <div className="alert alert-warning">Nenhum produto adicionado ao pedido ainda.</div>
        ) : (
          <ul className="list-group mb-3">
            {selectedProducts.map(item => {
              const totalItemPrice = item.price ? (item.price * item.quantity).toFixed(2).replace('.', ',') : '0,00';
              const unitPrice = item.price ? item.price.toFixed(2).replace('.', ',') : '0,00';

              return (
                <li key={item.productId} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    {item.name} - R$ {totalItemPrice}
                    <div className="text-muted small">R$ {unitPrice} (un.)</div>
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
              );
            })}
          </ul>
        )}


        <h4 className="text-end mt-4">Total: R$ {calculateTotal().toFixed(2).replace('.', ',')}</h4>

        {/* Botões de Ação */}
        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-success me-2" disabled={submitting || selectedProducts.length === 0}>
            {submitting ? (order ? 'Salvando...' : 'Criando...') : (order ? 'Salvar Alterações' : 'Salvar Pedido')}
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
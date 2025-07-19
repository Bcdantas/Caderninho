import { useState, useEffect } from 'react';
import { Plus, Minus, User, ShoppingBag, Search, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CustomerForm from "./CustomerForm";
import { Product, Customer, OrderItem } from '../types';

type OrderFormProps = {
  onCancel: () => void;
};

const OrderForm = ({ onCancel }: OrderFormProps) => {
  const { products, customers, addOrder, getProductById, refreshData } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searchTermProduct, setSearchTermProduct] = useState('');
  const [searchTermCustomer, setSearchTermCustomer] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [error, setError] = useState('');

  // No need for useEffect here for customer searchTerm anymore
  // as the display logic directly uses selectedCustomerId or filters based on searchTermCustomer
  // and handleCustomerCardClick will manage searchTermCustomer.

  // Filtra produtos baseado no termo de busca para exibir nos cards
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTermProduct.toLowerCase())
  );

  // Filtra clientes baseado no termo de busca para exibir nos cards
  // Se um cliente já foi selecionado, não mostra outros clientes na busca
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTermCustomer.toLowerCase())
  );

  // Lógica para selecionar cliente clicando no card
  const handleCustomerCardClick = (customer: Customer) => {
    setSelectedCustomerId(customer._id); // <--- ESTE É O PONTO CRÍTICO
    setSearchTermCustomer(customer.name); // Atualiza o input de busca com o nome do cliente selecionado
    setError(''); // Limpa qualquer erro anterior
  };

  // Lógica para desmarcar o cliente selecionado e reabrir a busca
  const handleRemoveCustomerSelection = () => {
    setSelectedCustomerId(null);
    setSearchTermCustomer(''); // Limpa o termo de busca para exibir todos os cards novamente
  };


  // Calcula o total do pedido
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = getProductById(item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Lógica para adicionar/incrementar produto ao pedido clicando no card
  const handleProductCardClick = (product: Product) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === product._id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        return [
          ...prevItems,
          { productId: product._id, quantity: 1 }, // <--- ID DO PRODUTO AQUI
        ];
      }
    });
    setError('');
  };

  // Lógica para remover um item da lista de pedidos ou diminuir a quantidade
  const handleRemoveOrDecrementItem = (productId: string) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        if (updatedItems[existingItemIndex].quantity > 1) {
          updatedItems[existingItemIndex].quantity -= 1;
        } else {
          updatedItems.splice(existingItemIndex, 1);
        }
        return updatedItems;
      }
      return prevItems;
    });
  };

  const handleSaveOrder = async () => {
    if (items.length === 0) {
      setError('Adicione pelo menos um item ao pedido.');
      return;
    }

    const newOrder = {
      customerId: selectedCustomerId, // <--- GARANTA QUE ESTÁ USANDO ESTE ESTADO
      items: items,
      total: calculateTotal(),
      isPaid: false,
    };
    
    await addOrder(newOrder);
    // refreshData() é chamado dentro de addOrder (no AppContext), mas reforçar aqui não faz mal
    refreshData(); 
    onCancel();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Novo Pedido</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Seleção de Cliente por Cards */}
      <div className="mb-6 border-b pb-4">
        <h3 className="text-xl font-semibold mb-3 flex items-center">
          <User size={20} className="mr-2 text-gray-600" />
          Cliente
        </h3>
        {isAddingCustomer ? (
          <CustomerForm
            onCancel={() => setIsAddingCustomer(false)}
            onSave={(newCustomer) => {
              setSelectedCustomerId(newCustomer._id);
              setIsAddingCustomer(false);
            }}
          />
        ) : (
          <>
            {selectedCustomerId ? (
              <div className="mt-2 text-gray-700 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-amber-300">
                <span>
                    Cliente selecionado: <span className="font-semibold">{customers.find(c => c._id === selectedCustomerId)?.name}</span>
                </span>
                <button
                    onClick={handleRemoveCustomerSelection} // Usar nova função
                    className="ml-2 px-2 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300 text-sm"
                >
                    Remover seleção
                </button>
              </div>
            ) : (
              // Área de busca e cards de clientes
              <div>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchTermCustomer}
                    onChange={(e) => setSearchTermCustomer(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 mb-3">
                  {filteredCustomers.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 py-4">Nenhum cliente encontrado. Adicione clientes na aba "Clientes".</p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        onClick={() => handleCustomerCardClick(customer)}
                        className="bg-gray-50 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-transparent"
                      >
                        <h4 className="font-bold text-gray-800 text-md">{customer.name}</h4>
                        {customer.hasDebt && (
                            <span className="text-red-600 text-xs font-semibold">Com Dívida!</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setSelectedCustomerId(null)} // Deixar como cliente avulso
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded mr-2 hover:bg-gray-300"
                >
                  Cliente Avulso
                </button>
                <button
                  onClick={() => setIsAddingCustomer(true)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Novo Cliente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Adicionar Produtos por Cards */}
      <div className="mb-6 border-b pb-4">
        <h3 className="text-xl font-semibold mb-3 flex items-center">
          <ShoppingBag size={20} className="mr-2 text-gray-600" />
          Adicionar Produtos
        </h3>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTermProduct}
            onChange={(e) => setSearchTermProduct(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhum produto encontrado. Adicione produtos na aba "Produtos".</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductCardClick(product)}
                className="bg-gray-50 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-amber-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <h4 className="font-bold text-gray-800 text-md">{product.name}</h4>
                <p className="text-amber-700 font-semibold text-lg">R$ {product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo do Pedido */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 flex items-center">
          <ShoppingBag size={20} className="mr-2 text-gray-600" />
          Itens do Pedido
        </h3>
        {items.length === 0 ? (
          <p className="text-gray-500">Nenhum item adicionado ainda.</p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {items.map((item) => {
              const product = getProductById(item.productId);
                function handleRemoveItem(productId: string): void {
                setItems((prevItems) => prevItems.filter(item => item.productId !== productId));
                }
              return (
                <li key={item.productId} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="flex-grow">
                    {product ? product.name : 'Produto Desconhecido'} (x**{item.quantity}**) -{' '}
                    **R$ {(product ? product.price * item.quantity : 0).toFixed(2)}**
                  </span>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handleRemoveOrDecrementItem(item.productId)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      aria-label="Diminuir quantidade ou remover"
                    >
                      {item.quantity > 1 ? <Minus size={16} /> : <XCircle size={16} />}
                    </button>
                    {/* Botão de remoção total para o caso de querer remover mesmo com quantidade > 1 */}
                    {item.quantity > 0 && ( 
                      <button
                        onClick={() => handleRemoveItem(item.productId)} // Removido do handleRemoveOrDecrementItem para separar
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Remover item completamente"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-2xl font-bold text-right mt-4 text-amber-700">
          Total: R$ {calculateTotal().toFixed(2)}
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSaveOrder}
          className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Salvar Pedido
        </button>
      </div>
    </div>
  );
};

export default OrderForm;
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Customer, Order, AppTab, OrderItem, Debt } from '../types'; // Importe Debt

interface AppContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  debts: Debt[]; // NOVO ESTADO AQUI
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  // Métodos CRUD para Produtos
  addProduct: (product: Omit<Product, '_id'>) => Promise<Product | undefined>;
  updateProduct: (product: Product) => Promise<Product | undefined>;
  deleteProduct: (id: string) => Promise<boolean>;
  // Métodos CRUD para Clientes
  addCustomer: (customer: Omit<Customer, '_id' | 'hasDebt'>) => Promise<Customer | undefined>; // hasDebt é omitido aqui pois não é mais do modelo
  updateCustomer: (customer: Customer) => Promise<Customer | undefined>;
  deleteCustomer: (id: string) => Promise<boolean>;
  // Métodos CRUD para Pedidos
  addOrder: (order: Omit<Order, '_id' | 'date'>) => Promise<Order | undefined>;
  updateOrder: (order: Order) => Promise<Order | undefined>;
  deleteOrder: (id: string) => Promise<boolean>;
  markOrderAsPaid: (id: string) => Promise<Order | undefined>;
  // Helpers
  getProductById: (id: string) => Product | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  calculateOrderTotal: (items: OrderItem[]) => number;
  getCustomersWithDebt: () => (Customer & { totalDebt: number; hasDebt: boolean })[]; // Assinatura atualizada
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:4000/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]); // NOVO ESTADO INICIALIZADO
  const [activeTab, setActiveTab] = useState<AppTab>('orders');

  const refreshData = useCallback(async () => {
    try {
      const [productsRes, customersRes, ordersRes, debtsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/customers`),
        fetch(`${API_BASE_URL}/orders`),
        fetch(`${API_BASE_URL}/debts`), // BUSCA A NOVA ROTA DE DÍVIDAS AQUI
      ]);

      if (!productsRes.ok || !customersRes.ok || !ordersRes.ok || !debtsRes.ok) {
        throw new Error('Falha ao buscar dados da API');
      }

      const fetchedProducts = await productsRes.json();
      const fetchedCustomers = await customersRes.json();
      const fetchedOrders = await ordersRes.json();
      const fetchedDebts = await debtsRes.json();

      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
      setOrders(fetchedOrders);
      setDebts(fetchedDebts); // DEFINE O ESTADO DE DÍVIDAS
    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- Métodos de Produtos ---
  const addProduct = async (product: Omit<Product, '_id'>): Promise<Product | undefined> => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Falha ao adicionar produto');
      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      return undefined;
    }
  };

  const updateProduct = async (updatedProduct: Product): Promise<Product | undefined> => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${updatedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!res.ok) throw new Error('Falha ao atualizar produto');
      const data = await res.json();
      setProducts((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return undefined;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        return true;
      }
      throw new Error('Falha ao deletar produto');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return false;
    }
  };

  const getProductById = (id: string) => {
    return products.find((p) => p._id === id);
  };

  // --- Métodos de Clientes ---
  const addCustomer = async (customer: Omit<Customer, '_id' | 'hasDebt'>): Promise<Customer | undefined> => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      if (!res.ok) throw new Error('Falha ao adicionar cliente');
      const newCustomer = await res.json();
      setCustomers((prev) => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      return undefined;
    }
  };

  const updateCustomer = async (updatedCustomer: Customer): Promise<Customer | undefined> => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${updatedCustomer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCustomer),
      });
      if (!res.ok) throw new Error('Falha ao atualizar cliente');
      const data = await res.json();
      setCustomers((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return undefined;
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
        return true;
      }
      throw new Error('Falha ao deletar cliente');
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      return false;
    }
  };

  const getCustomerById = (id: string) => {
    return customers.find((c) => c._id === id);
  };

  // getCustomersWithDebt agora usa a nova coleção 'debts' para determinar quem tem dívida
  const getCustomersWithDebt = useCallback(() => {
    // Filtra as entradas de dívida que têm totalDebt > 0
    // Mapeia essas dívidas para os objetos de cliente correspondentes
    return debts
      .filter(debt => debt.totalDebt > 0)
      .map(debt => {
        const customer = customers.find(c => c._id === debt.customerId);
        // Retorna o objeto de cliente com um hasDebt *virtual* e o totalDebt REAL da coleção 'debts'
        return customer ? { ...customer, hasDebt: true, totalDebt: debt.totalDebt } : undefined;
      })
      .filter(Boolean) as (Customer & { totalDebt: number; hasDebt: boolean })[]; // Cast para garantir o tipo

  }, [debts, customers]);


  // --- Métodos de Pedidos ---
  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => {
      // Busca o produto no estado 'products' do AppContext
      const product = products.find(p => p._id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const addOrder = async (order: Omit<Order, '_id' | 'date'>): Promise<Order | undefined> => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error('Falha ao adicionar pedido');
      const newOrder = await res.json();
      setOrders((prev) => [...prev, newOrder]);
      refreshData(); // Chamada importante para atualizar TODOS os estados (incluindo 'debts' e 'customers')
      return newOrder;
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error);
      return undefined;
    }
  };

  const updateOrder = async (updatedOrder: Order): Promise<Order | undefined> => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${updatedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      });
      if (!res.ok) throw new Error('Falha ao atualizar pedido');
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
      refreshData(); // Chamada importante para atualizar TODOS os estados
      return data;
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      return undefined;
    }
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
        return true;
      }
      throw new Error('Falha ao deletar pedido');
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      return false;
    }
  };

  const markOrderAsPaid = async (id: string): Promise<Order | undefined> => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Falha ao marcar pedido como pago');
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
      refreshData(); // Chamada importante para atualizar TODOS os estados
      return data;
    } catch (error) {
      console.error('Erro ao marcar pedido como pago:', error);
      return undefined;
    }
  };

  // --- Valor do Contexto ---
  const value = {
    products,
    customers,
    orders,
    debts, // NOVO VALOR AQUI
    activeTab,
    setActiveTab,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    updateOrder,
    deleteOrder,
    markOrderAsPaid,
    getProductById,
    getCustomerById,
    calculateOrderTotal,
    getCustomersWithDebt,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
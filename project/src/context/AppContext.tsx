import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Customer, Order, AppTab, OrderItem } from '../types';

interface AppContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  // Métodos CRUD para Produtos
  addProduct: (product: Omit<Product, '_id'>) => Promise<Product | undefined>;
  updateProduct: (product: Product) => Promise<Product | undefined>;
  deleteProduct: (id: string) => Promise<boolean>;
  // Métodos CRUD para Clientes
  addCustomer: (customer: Omit<Customer, '_id' | 'hasDebt'>) => Promise<Customer | undefined>;
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
  getCustomersWithDebt: () => Customer[];
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:4000/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('orders');

  const refreshData = useCallback(async () => {
    try {
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/customers`),
        fetch(`${API_BASE_URL}/orders`),
      ]);

      if (!productsRes.ok || !customersRes.ok || !ordersRes.ok) {
        throw new Error('Falha ao buscar dados da API');
      }

      const fetchedProducts = await productsRes.json();
      const fetchedCustomers = await customersRes.json();
      const fetchedOrders = await ordersRes.json();

      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Resto das suas funções (addProduct, updateProduct, etc.) devem estar como no meu último envio.
  // Apenas garantindo que addOrder, updateOrder, deleteOrder, markOrderAsPaid chamem refreshData() no final.

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
      refreshData();
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
      refreshData();
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
        refreshData();
        return true;
      }
      throw new Error('Falha ao deletar produto');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return false;
    }
  };
  const getProductById = (id: string) => { return products.find((p) => p._id === id); };

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
      refreshData();
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
      refreshData();
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
        refreshData();
        return true;
      }
      throw new Error('Falha ao deletar cliente');
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      return false;
    }
  };
  const getCustomerById = (id: string) => { return customers.find((c) => c._id === id); };
  const getCustomersWithDebt = () => { return customers.filter((c) => c.hasDebt); };

  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => {
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
      refreshData(); // Chamada importante
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
      refreshData(); // Chamada importante
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
        refreshData(); // Chamada importante
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
      refreshData(); // Chamada importante
      return data;
    } catch (error) {
      console.error('Erro ao marcar pedido como pago:', error);
      return undefined;
    }
  };

  const value = {
    products, customers, orders, activeTab, setActiveTab, addProduct, updateProduct, deleteProduct,
    addCustomer, updateCustomer, deleteCustomer, addOrder, updateOrder, deleteOrder, markOrderAsPaid,
    getProductById, getCustomerById, calculateOrderTotal, getCustomersWithDebt, refreshData,
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
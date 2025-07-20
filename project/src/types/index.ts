export interface Product {
  _id: string;
  name: string;
  price: number;
}

export interface Customer {
  _id: string;
  name: string;
  // REMOVIDO: hasDebt: boolean;
  totalDebt?: number; // Adicionado para facilitar a passagem do valor da dívida
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  _id: string;
  customerId: string | null;
  items: OrderItem[];
  total: number;
  date: string;
  isPaid: boolean;
}

export interface Debt { // Nova interface para a coleção de Dívidas
  _id: string;
  customerId: string;
  totalDebt: number;
}

export type AppTab = 'orders' | 'products' | 'customers' | 'debts';

export type Role = 'admin' | 'waiter';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
}
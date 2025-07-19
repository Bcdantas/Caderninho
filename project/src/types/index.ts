export interface Product {
  _id: string; // Garanta que é _id
  name: string;
  price: number;
}

export interface Customer {
  _id: string; // Garanta que é _id
  name: string;
  hasDebt: boolean;
}

export interface OrderItem {
  productId: string; // Este é o _id do produto no banco
  quantity: number;
}

export interface Order {
  _id: string; // Garanta que é _id
  customerId: string | null; // Pode ser null se o pedido não tiver cliente
  items: OrderItem[];
  total: number;
  date: string;
  isPaid: boolean;
}

export type AppTab = 'orders' | 'products' | 'customers' | 'debts';

export type Role = 'admin' | 'waiter';

export interface User {
  id: string; // O ID do usuário (não está no MongoDB, é interno)
  username: string;
  password?: string;
  role: Role;
  name: string;
}
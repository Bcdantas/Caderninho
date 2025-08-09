// CAMINHO: src/types/Order.ts

import { Product } from './Product';
import { Customer } from './Customer';

export interface OrderItem {
    product: Product;
    quantity: number;
    priceAtOrder: number;
}

export interface Order {
    _id: string;
    customer: Customer;
    items: OrderItem[];
    totalAmount: number;
    isPaid: boolean;
    createdAt: Date;
}
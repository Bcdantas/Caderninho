// src/types/ProductTypes.ts

export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string; // Opcional
  createdAt: string;
  updatedAt: string;
}
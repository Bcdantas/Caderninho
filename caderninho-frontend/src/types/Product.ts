// CAMINHO: src/types/Product.ts

export interface Product {
    _id: string;
    name: string;
    price: number;
    description?: string;
    quantityInStock: number;
}
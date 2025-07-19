import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

interface ProductFormProps {
  product?: Product;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onCancel }) => {
  const { addProduct, updateProduct } = useApp();
  
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nome do produto é obrigatório');
      return;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError('Preço deve ser um número válido maior que zero');
      return;
    }
    
    const productData = {
      name: name.trim(),
      price: Number(price),
    };
    
    if (product) {
      await updateProduct({ ...product, ...productData, _id: product._id });
    } else {
      await addProduct(productData);
    }
    
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {product ? 'Editar Produto' : 'Novo Produto'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
          Nome *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          autoFocus
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="price" className="block text-gray-700 font-medium mb-1">
          Preço (R$) *\n
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          step="0.01"
          min="0.01"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
        >
          {product ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
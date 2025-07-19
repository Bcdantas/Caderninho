import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ProductForm from './ProductForm';
import { Product } from '../types';

const ProductList: React.FC = () => {
  const { products, deleteProduct } = useApp();
  const { isWaiter } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id);
    }
  };

  if (isAdding || editingProduct) {
    return (
      <ProductForm
        product={editingProduct || undefined}
        onCancel={() => {
          setIsAdding(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Produtos</h2>
        {!isWaiter && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus size={18} className="mr-1" />
            Novo Produto
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          {searchTerm ? (
            <p>Nenhum produto encontrado para "{searchTerm}"</p>
          ) : (
            <p>Nenhum produto cadastrado. Adicione seu primeiro produto!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-gray-600">R$ {product.price.toFixed(2)}</p>
              {!isWaiter && (
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    aria-label="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
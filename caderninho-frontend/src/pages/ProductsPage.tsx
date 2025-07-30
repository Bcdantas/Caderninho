// CAMINHO: src/pages/ProductsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/ProductForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';

export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  quantityInStock: number;
}

const ProductsPage: React.FC = () => {
  const { userToken } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/products?keyword=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar produtos.');
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }, [userToken, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }
    if (!userToken) {
      setError('Você precisa estar logado para deletar produtos.');
      return;
    }

    try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userToken}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao deletar produto.');
        }
        setProducts(products.filter(p => p._id !== id));
        alert('Produto deletado com sucesso!');
    } catch (err: any) {
        setError(err.message || 'Erro ao deletar produto.');
    } finally {
        setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingProduct(null);
    // Não precisa chamar fetchProducts() aqui, o useEffect já vai cuidar disso
    // se o searchTerm for limpo, por exemplo. Mas por segurança, podemos manter.
    fetchProducts();
  };
  
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Produtos</h2>

      {showForm ? (
        <ProductForm
          product={editingProduct}
          onSave={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <button className="btn btn-primary" onClick={handleAddProduct}>
              <FontAwesomeIcon icon={faPlus} className="me-2" /> Adicionar Produto
            </button>

            <div className="input-group" style={{ maxWidth: '400px' }}>
              <span className="input-group-text">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center mt-5"><h4>Carregando produtos...</h4></div>
          ) : products.length === 0 ? (
            <div className="alert alert-info">{searchTerm ? `Nenhum produto encontrado para "${searchTerm}".` : 'Nenhum produto cadastrado.'}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>R$ {product.price.toFixed(2).replace('.', ',')}</td>
                      <td className={ (product.quantityInStock || 0) <= 0 ? 'text-danger fw-bold' : '' }>
                        {product.quantityInStock || 0}
                      </td>
                      <td>{product.description || 'N/A'}</td>
                      <td>
                        <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => handleEditProduct(product)}
                            title="Editar"
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProduct(product._id)}
                            title="Deletar"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
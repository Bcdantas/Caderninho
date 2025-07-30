// CAMINHO: src/pages/ProductsPage.tsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/ProductForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// <<< PASSO 1: ATUALIZAR A INTERFACE PARA INCLUIR O ESTOQUE >>>
export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  quantityInStock: number; // Campo de estoque adicionado
}

const ProductsPage: React.FC = () => {
  const { userToken } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [userToken]);

  const fetchProducts = async () => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`, {
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
    // O restante da função permanece igual
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
    fetchProducts();
  };

  if (loading) return <div className="text-center mt-5">Carregando produtos...</div>;
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
        <button className="btn btn-primary mb-3" onClick={handleAddProduct}>
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Adicionar Produto
        </button>

          {products.length === 0 ? (
            <div className="alert alert-info">Nenhum produto cadastrado.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Preço</th>
                    {/* <<< PASSO 2: ADICIONAR O CABEÇALHO DA COLUNA DE ESTOQUE >>> */}
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
                      
                      {/* <<< PASSO 3: ADICIONAR A CÉLULA DE DADOS DO ESTOQUE >>> */}
                      {/* Adicionamos uma classe condicional para destacar estoque baixo/negativo */}
                      <td className={ (product.quantityInStock || 0) <= 0 ? 'text-danger fw-bold' : '' }>
                        {/* Usamos '|| 0' para mostrar 0 em produtos antigos que ainda não têm o campo */}
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
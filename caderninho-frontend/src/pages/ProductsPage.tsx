import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext'; // Para pegar o token de autenticação
import ProductForm from '../components/ProductForm'; // Formulário para adicionar/editar produtos

const ProductsPage: React.FC = () => {
  const { userToken } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false); // Estado para controlar a visibilidade do formulário
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Produto sendo editado

  useEffect(() => {
    fetchProducts();
  }, [userToken]); // Refaz a busca se o token mudar (ex: login/logout)

  const fetchProducts = async () => {
    if (!userToken) return; // Não busca se não houver token
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/products', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`, // Envia o token de autenticação
        },
      });

      if (!response.ok) {
        // Tenta ler a mensagem de erro do backend
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar produtos.');
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produtos.');
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null); // Garante que estamos adicionando, não editando
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product); // Define o produto para edição
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

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao deletar produto.');
      }
      // Remove o produto da lista sem precisar recarregar tudo
      setProducts(products.filter(p => p._id !== id));
      alert('Produto deletado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar produto.');
      console.error('Erro ao deletar produto:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false); // Fecha o formulário após adicionar/editar
    setEditingProduct(null); // Limpa o produto em edição
    fetchProducts(); // Recarrega a lista para mostrar as mudanças
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
            Adicionar Produto
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
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>R$ {product.price.toFixed(2).replace('.', ',')}</td>
                      <td>{product.description || 'N/A'}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditProduct(product)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Deletar
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
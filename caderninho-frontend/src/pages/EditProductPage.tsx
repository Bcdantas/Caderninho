import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'; // Ícone para loading

// Definição da interface do Produto (definida aqui para evitar erros de importação)
interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  // stock?: number; // Removido stock se nao esta no seu modelo Product.js
  createdAt: string;
  updatedAt: string;
}

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>(); // Pega o ID do produto da URL
  const navigate = useNavigate();
  const { userToken, showToast } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId && userToken) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`, {
            headers: { Authorization: `Bearer ${userToken}` },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao buscar produto para edição.');
          }
          const data: Product = await response.json();
          setProduct(data);
        } catch (err: any) {
          setError(err.message || 'Erro ao carregar produto para edição.');
          showToast(err.message || 'Erro ao carregar produto.', 'danger');
          navigate('/products'); // Volta para a lista se der erro ao carregar
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
        // Se não tem ID na URL ou não tem token, redireciona para a lista
        navigate('/products'); 
    }
  }, [productId, userToken, navigate, showToast]); // Adiciona dependências

  const handleSave = () => {
    // A ProductForm já exibe o toast de sucesso.
    navigate('/products'); // Redireciona de volta para a lista de produtos após salvar
  };

  const handleCancel = () => {
    navigate('/products'); // Volta para a lista sem salvar
  };

  if (loading) return <div className="text-center mt-5"><FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" /><p className="mt-2">Carregando produto para edição...</p></div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;
  if (!product) return <div className="alert alert-warning mt-3">Produto não encontrado para edição ou ID inválido.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Editar Produto</h2>
      <ProductForm product={product} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default EditProductPage;
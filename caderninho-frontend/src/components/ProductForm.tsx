// CAMINHO: src/components/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

// Interface atualizada para incluir o estoque
interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  quantityInStock: number; // <<< CAMPO ADICIONADO
}

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const { userToken } = useAppContext();
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  // <<< PASSO 1: Adicionar estado para a quantidade em estoque >>>
  const [quantityInStock, setQuantityInStock] = useState<string>('0');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toFixed(2));
      setDescription(product.description || '');
      // <<< PASSO 2: Preencher o campo de estoque no modo de edição >>>
      setQuantityInStock(product.quantityInStock.toString());
    } else {
      setName('');
      setPrice('');
      setDescription('');
      // <<< Limpar o campo de estoque no modo de adição >>>
      setQuantityInStock('0');
    }
    setError(null);
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) {
      setError('Você precisa estar logado para realizar esta operação.');
      return;
    }
    setLoading(true);
    setError(null);

    if (!name || !price || isNaN(parseFloat(price))) {
      setError('Nome e Preço devem ser preenchidos corretamente.');
      setLoading(false);
      return;
    }
    if (parseFloat(price) < 0) {
        setError('Preço não pode ser negativo.');
        setLoading(false);
        return;
    }

    const productData = {
      name,
      price: parseFloat(price),
      description: description || undefined,
      // <<< PASSO 3: Enviar a quantidade em estoque para o backend >>>
      quantityInStock: parseInt(quantityInStock, 10) || 0 // Converte para número
    };

    const method = product ? 'PUT' : 'POST';
    const url = product ? `${import.meta.env.VITE_API_BASE_URL}/api/products/${product._id}` : `${import.meta.env.VITE_API_BASE_URL}/api/products`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Falha ao ${product ? 'atualizar' : 'criar'} produto.`);
      }
      alert(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
    } catch (err: any) {
      setError(err.message || `Erro ao ${product ? 'atualizar' : 'criar'} produto.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <h4 className="mb-3">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h4>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            <div className="mb-3">
              <label htmlFor="productName" className="form-label">Nome do Produto</label>
              <input
                type="text"
                className="form-control"
                id="productName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="productPrice" className="form-label">Preço (R$)</label>
                <input
                  type="number" 
                  className="form-control"
                  id="productPrice"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
          </div>
        </div>
        
        {/* <<< PASSO 4: Adicionar o campo de input para o estoque >>> */}
        <div className="mb-3">
            <label htmlFor="quantityInStock" className="form-label">Quantidade em Estoque</label>
            <input
                type="number"
                className="form-control"
                id="quantityInStock"
                value={quantityInStock}
                onChange={(e) => setQuantityInStock(e.target.value)}
                step="1" // Apenas números inteiros
                disabled={loading}
            />
        </div>

        <div className="mb-3">
          <label htmlFor="productDescription" className="form-label">Descrição (Opcional)</label>
          <textarea
            className="form-control"
            id="productDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-success me-2" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
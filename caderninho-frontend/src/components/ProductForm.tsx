import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext'; // Para pegar o token

interface ProductFormProps {
  product?: Product | null; // Produto opcional para edição
  onSave: () => void; // Callback após salvar
  onCancel: () => void; // Callback para cancelar
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const { userToken } = useAppContext();
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>(''); // Usar string para o input do preço
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se um produto for passado (modo edição), preenche o formulário
    if (product) {
      setName(product.name);
      setPrice(product.price.toFixed(2)); // Formata o preço para 2 casas decimais
      setDescription(product.description || '');
    } else {
      // Limpa o formulário se não houver produto (modo adição)
      setName('');
      setPrice('');
      setDescription('');
    }
    setError(null); // Limpa erros ao abrir/mudar o formulário
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToken) {
      setError('Você precisa estar logado para realizar esta operação.');
      return;
    }

    setLoading(true);
    setError(null);

    // Validação básica
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
      price: parseFloat(price), // Converte o preço de volta para número
      description: description || undefined // Envia undefined se vazio para não salvar string vazia
    };

    const method = product ? 'PUT' : 'POST';
    const url = product ? `http://localhost:4000/api/products/${product._id}` : 'http://localhost:4000/api/products';

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
      onSave(); // Chama o callback para fechar o formulário e recarregar a lista
    } catch (err: any) {
      setError(err.message || `Erro ao ${product ? 'atualizar' : 'criar'} produto.`);
      console.error(`Erro ao ${product ? 'atualizar' : 'criar'} produto:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <h4 className="mb-3">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h4>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form onSubmit={handleSubmit}>
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
        <div className="mb-3">
          <label htmlFor="productPrice" className="form-label">Preço</label>
          <input
            type="number" 
            className="form-control"
            id="productPrice"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01" // Permite valores decimais
            required
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
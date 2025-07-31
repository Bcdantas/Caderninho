// CAMINHO: src/components/Pagination.tsx

import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap'; // Usaremos o componente do react-bootstrap

interface PaginationProps {
  pages: number; // Total de páginas
  page: number;  // Página atual
  onPageChange: (pageNumber: number) => void; // Função para mudar de página
}

const Pagination: React.FC<PaginationProps> = ({ pages, page, onPageChange }) => {
  if (pages <= 1) {
    return null; // Não mostra a paginação se houver apenas 1 página ou menos
  }

  return (
    <BootstrapPagination className="justify-content-center">
      {/* Botão de Voltar */}
      <BootstrapPagination.Prev 
        onClick={() => onPageChange(page - 1)} 
        disabled={page === 1} 
      />

      {/* Gera os botões de número de página */}
      {[...Array(pages).keys()].map((x) => (
        <BootstrapPagination.Item 
          key={x + 1} 
          active={x + 1 === page} 
          onClick={() => onPageChange(x + 1)}
        >
          {x + 1}
        </BootstrapPagination.Item>
      ))}

      {/* Botão de Avançar */}
      <BootstrapPagination.Next 
        onClick={() => onPageChange(page + 1)} 
        disabled={page === pages} 
      />
    </BootstrapPagination>
  );
};

export default Pagination;
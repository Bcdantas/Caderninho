import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext'; // Importa o contexto de autenticação

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Opcional: lista de papéis permitidos para esta rota
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { userToken, userRole } = useAppContext();// Pega o status de autenticação e papel do contexto

  console.log('--- ProtectedRoute Check ---'); // <<-- NOVO LOG
  console.log('userToken em ProtectedRoute:', userToken ? 'PRESENTE' : 'AUSENTE'); // <<-- NOVO LOG
  console.log('userRole em ProtectedRoute:', userRole);

if (!userToken) { // Verifica o token diretamente
        console.log('ProtectedRoute: Token AUSENTE. Redirecionando para login.'); // <<-- NOVO LOG
        return <Navigate to="/login" replace />;
    }
    
  if (loading) {
    return <div>Carregando autenticação...</div>;
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // 'replace' para não adicionar a rota protegida ao histórico do navegador
  }

  // Se houver papéis permitidos e o papel do usuário não estiver na lista, redireciona
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />; // Redireciona para o dashboard se não tiver permissão
  }

  // Se estiver autenticado e tiver permissão, renderiza o conteúdo da rota aninhada
  return <Outlet />;
};

export default ProtectedRoute;
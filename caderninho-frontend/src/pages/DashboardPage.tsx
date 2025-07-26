import React from 'react';
import { useAppContext } from '../context/AppContext'; // Para pegar o nome do usuário

// Definimos o tipo de usuário aqui mesmo, para evitar o problema anterior com 'src/types/index.ts'
interface UserAuthData {
  _id: string;
  username: string;
  role: string;
}

const DashboardPage: React.FC = () => {
  const { username, userRole } = useAppContext(); // Pega o nome de usuário e papel do contexto

  return (
    <div className="container mt-4">
      <div className="alert alert-success" role="alert">
        <h4 className="alert-heading">Bem-vindo, {username}!</h4>
        <p className="mb-0">Você está logado como **{userRole}**.</p>
        <hr />
        <p className="mb-0">Este é o painel de controle do seu Caderninho.</p>
      </div>
      <p>Conteúdo do Dashboard virá aqui.</p>
      {/* Futuramente, links para outras seções */}
    </div>
  );
};

export default DashboardPage;
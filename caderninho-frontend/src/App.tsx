import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header/Navbar - Será adicionado aqui mais tarde */}
      {/* <Navbar /> */}

      {/* Conteúdo principal, onde as páginas serão renderizadas */}
      <main className="flex-grow p-4">
        <Outlet />
      </main>

      {/* Footer - Opcional, pode ser adicionado aqui */}
      {/* <Footer /> */}
    </div>
  );
}

export default App;
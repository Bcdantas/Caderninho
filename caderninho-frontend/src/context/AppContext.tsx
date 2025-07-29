import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
// A interface ToastMessage é definida inline no AppContext, então não precisa ser importada aqui
// (A ToastNotification que importa essa interface localmente)


// Definição das interfaces
interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
}

interface AppContextType {
  username: string | null;
  userRole: string | null;
  userToken: string | null;
  login: (token: string, name: string, role: string) => void;
  logout: () => void;
  showToast: (message: string, type: 'success' | 'danger' | 'info' | 'warning') => void;
  toasts: ToastMessage[]; // Toasts adicionado
  removeToast: (id: string) => void; // removeToast adicionado
}

// Criação do Contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provedor do Contexto
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializa o estado lendo do localStorage
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));
  const [userToken, setUserToken] = useState<string | null>(localStorage.getItem('userToken'));
  const [toasts, setToasts] = useState<ToastMessage[]>([]); // Estado para os toasts
  
  const navigate = useNavigate();

  // <<-- INÍCIO: FUNÇÃO SHOWTOAST (PRECISA ESTAR AQUI ANTES DE LOGIN/LOGOUT!) -->>
  const showToast = useCallback((message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString(); // Gera um ID único baseado no tempo para o toast (como string)
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000); // Toast desaparece após 5 segundos
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  // <<-- FIM: FUNÇÃO SHOWTOAST -->>


  // <<-- INÍCIO: FUNÇÃO LOGIN (AGORA PODE CHAMAR showToast) -->>
  const login = useCallback((token: string, name: string, role: string) => {
    setUserToken(token);
    setUsername(name);
    setUserRole(role);
    // Salva no localStorage para persistência
    localStorage.setItem('userToken', token);
    localStorage.setItem('username', name);
    localStorage.setItem('userRole', role);
    
    console.log('*** AppContext: Login bem-sucedido, estado e localStorage atualizados. Token:', token ? 'SIM' : 'NÃO', 'Role:', role);
    showToast('Login realizado com sucesso!', 'success');
    navigate('/dashboard'); // Redireciona para o dashboard
  }, [navigate, showToast]); // showToast como dependência aqui é correto


  // <<-- INÍCIO: FUNÇÃO LOGOUT (AGORA PODE CHAMAR showToast) -->>
  const logout = useCallback(() => {
    setUserToken(null);
    setUsername(null);
    setUserRole(null);
    // Remove do localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    
    console.log('*** AppContext: Logout realizado, estado e localStorage limpos.');
    showToast('Você foi desconectado.', 'info');
    navigate('/login'); // Redireciona para a página de login
  }, [navigate, showToast]);


  // Efeito para recarregar estado do localStorage ao montar o provedor
  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUsername = localStorage.getItem('username');
    const storedUserRole = localStorage.getItem('userRole');

    if (storedToken && storedUsername && storedUserRole) {
      setUserToken(storedToken);
      setUsername(storedUsername);
      setUserRole(storedUserRole);
      // Não redireciona aqui, o AppRouter (main.tsx) decide o redirecionamento inicial
    }
  }, []); // Dependências vazias para rodar apenas uma vez na montagem


  return (
    <AppContext.Provider value={{ username, userRole, userToken, login, logout, showToast, toasts, removeToast }}>
      {children}
      {/* Container para as notificações Toast. Renderizado aqui no AppProvider. */}
      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1050 }} // Garante que fique acima de outros elementos
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast align-items-center text-white border-0 ${
              toast.type === 'success' ? 'bg-success' :
              toast.type === 'danger' ? 'bg-danger' :
              toast.type === 'info' ? 'bg-info' :
              toast.type === 'warning' ? 'bg-warning text-dark' :
              'bg-secondary'
            }`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            // Não usamos ref={toastRef} aqui, o ToastNotification.tsx individual lida com isso.
            // Apenas para exibir o toast simples.
            // Para controlar o fechamento via BS JS, cada ToastNotification teria que ser um componente completo.
          >
            <div className="d-flex">
              <div className="toast-body">
                {toast.message}
              </div>
              <button
                type="button"
                className={`btn-close ${toast.type === 'warning' ? 'btn-close-dark' : 'btn-close-white'} me-2 m-auto`}
                onClick={() => removeToast(toast.id)} // Remove toast ao clicar no X
                aria-label="Close"
              ></button>
            </div>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importa o modelo de Usuário

const protect = async (req, res, next) => {
  let token;

  // 1. Verifica se o token está no cabeçalho Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrai o token (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Encontra o usuário pelo ID do token e anexa ao objeto req
      req.user = await User.findById(decoded.id).select('-password'); // Não retorna a senha

      if (!req.user) {
          res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
          return;
      }

      next(); // Passa para o próximo middleware/rota

    } catch (error) {
      console.error('Erro no middleware de autenticação:', error);
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, nenhum token.' });
  }
};

// Middleware para verificar o papel do usuário (ex: apenas 'admin')
const authorizeRoles = (...roles) => { // Aceita múltiplos papéis (ex: 'admin', 'employee')
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Acesso negado: Requer um dos papéis: ${roles.join(', ')}` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
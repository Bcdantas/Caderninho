// CAMINHO: caderninho-backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Garanta que o caminho para seu modelo User está correto

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Pega o token do cabeçalho
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifica e decodifica o token para obter o ID do usuário
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Busca o usuário no banco de dados pelo ID e anexa à requisição
            // O '-password' remove o campo da senha do objeto retornado
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
            }

            next(); // Se tudo deu certo, avança para a próxima etapa (a rota)
        } catch (error) {
            console.error('Erro na autenticação do token:', error);
            res.status(401).json({ message: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Não autorizado, sem token.' });
    }
};

// Middleware para verificar cargos (roles)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user foi anexado pelo middleware 'protect'
        if (!req.user || !roles.includes(req.user.role)) {
            // Se o cargo do usuário não está na lista de cargos permitidos
            return res.status(403).json({ 
                message: `Acesso negado: Requer um dos papéis: ${roles.join(',')}` 
            });
        }
        next(); // Se o cargo for permitido, avança.
    };
};

module.exports = { protect, authorizeRoles };
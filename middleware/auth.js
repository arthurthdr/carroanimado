import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // 1. Tenta pegar o token do cabeçalho da requisição
    const authHeader = req.header('Authorization');

    // Se não houver nenhum cabeçalho de autorização, nega o acesso
    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }

    // O cabeçalho deve ser no formato "Bearer [token]"
    // Vamos separar a palavra "Bearer" do token em si.
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Formato de token inválido. Use o formato "Bearer".' });
    }
    const token = tokenParts[1];

    try {
        // 2. Verifica se o token é válido e não expirou, usando o segredo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Se for válido, extrai o ID do usuário do token e o anexa ao objeto 'req'
        // Assim, as próximas rotas saberão qual usuário está fazendo a requisição.
        req.userId = decoded.userId;

        // 4. Deixa a requisição continuar para sua rota principal (ex: criar veículo)
        next();
    } catch (ex) {
        // Se jwt.verify falhar (token inválido, expirado, etc.), nega o acesso.
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

export default authMiddleware;
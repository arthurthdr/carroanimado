import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    console.log('\n--- [AUTH MIDDLEWARE INICIADO] ---');
    console.log(`[AUTH] Rota: ${req.method} ${req.originalUrl}`);

    const authHeader = req.header('Authorization');
    if (!authHeader) {
        console.log('[AUTH] FALHA: Cabeçalho de autorização não encontrado.');
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }
    
    console.log('[AUTH] Cabeçalho encontrado:', authHeader);
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.log('[AUTH] FALHA: Formato de token incorreto.');
        return res.status(401).json({ error: 'Formato de token inválido.' });
    }
    
    const token = tokenParts[1];
    console.log('[AUTH] Token extraído:', token);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('[AUTH] ERRO CRÍTICO: Variável de ambiente JWT_SECRET não definida!');
        return res.status(500).json({ error: 'Erro de configuração interna do servidor.' });
    }
    console.log('[AUTH] Segredo JWT carregado com sucesso.');

    try {
        console.log('[AUTH] Tentando verificar o token...');
        const decoded = jwt.verify(token, secret);
        
        console.log('✅ [AUTH] SUCESSO! Token verificado e decodificado:', decoded);
        
        req.userId = decoded.userId;
        console.log(`[AUTH] userId '${req.userId}' adicionado à requisição.`);
        
        console.log('--- [AUTH MIDDLEWARE CONCLUÍDO] ---');
        next(); // Passa para a próxima etapa (a rota principal)
    } catch (ex) {
        console.error('❌ [AUTH] FALHA na verificação do token:', ex.message);
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

export default authMiddleware;
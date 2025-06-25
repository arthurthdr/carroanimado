import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
const port = process.env.PORT || 3001; // Porta para o servidor backend
                                    // Use uma porta diferente do frontend se rodar ambos localmente
const apiKey = process.env.OPENWEATHER_API_KEY;

// --- Estoque de Dados Mockados (Simulando Banco de Dados) ---

const veiculosDestaque = [
    { id: 1, modelo: "Ford Maverick Híbrido", ano: 2024, destaque: "Economia e Estilo", imagemUrl: "img/maverick_mock.jpg" },
    { id: 2, modelo: "VW Kombi Elétrica ID.Buzz", ano: 2025, destaque: "Nostalgia Eletrificada", imagemUrl: "img/kombi_mock.jpg" },
    { id: 3, modelo: "Cybertruck", ano: 2023, destaque: "Design Futurista", imagemUrl: "img/cybertruck_mock.jpg" },
    { id: 4, modelo: "Porsche Taycan", ano: 2024, destaque: "Esportivo Elétrico", imagemUrl: "img/taycan_mock.jpg" }
];

const servicosGaragem = [
    { id: "svc001", nome: "Diagnóstico Eletrônico Completo", descricao: "Verificação detalhada de todos os sistemas eletrônicos e injeção.", precoEstimado: "R$ 250,00" },
    { id: "svc002", nome: "Alinhamento e Balanceamento 3D", descricao: "Ajuste preciso para uma direção segura e maior vida útil dos pneus.", precoEstimado: "R$ 180,00" },
    { id: "svc003", nome: "Revisão Completa Freios", descricao: "Inspeção, limpeza e substituição de pastilhas/discos se necessário.", precoEstimado: "A partir de R$ 300,00" }
];

const ferramentasEssenciais = [
    { id: "fer01", nome: "Chave de Roda Cruz", utilidade: "Troca rápida de pneus.", linkCompra: "https://exemplo.com/chave-roda" },
    { id: "fer02", nome: "Macaco Hidráulico", utilidade: "Elevação segura do veículo.", linkCompra: "https://exemplo.com/macaco" },
    { id: "fer03", nome: "Multímetro Digital", utilidade: "Diagnóstico de problemas elétricos.", linkCompra: "https://exemplo.com/multimetro" },
    { id: "fer04", nome: "Kit Chaves Combinadas", utilidade: "Versatilidade para diversos parafusos e porcas.", linkCompra: "https://exemplo.com/kit-chaves" }
];

// --- Fim Estoque de Dados Mockados ---

// Middleware para permitir que o frontend (rodando em outra porta) acesse este backend
// (CORS - Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    // Em produção, restrinja para o seu domínio frontend (ex: 'https://suagaragem.com')
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // Se precisar usar métodos como PUT, POST, DELETE com cabeçalhos específicos, adicione:
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params; // Pega o parâmetro :cidade da URL

    if (!apiKey) {
        console.error("[Servidor] ERRO: Chave da API não configurada.");
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }
    if (!cidade) {
        console.warn("[Servidor] Aviso: Requisição sem nome de cidade.");
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log('[Servidor] Dados recebidos da OpenWeatherMap com sucesso.');

        // Enviamos a resposta da API OpenWeatherMap diretamente para o nosso frontend
        res.json(apiResponse.data);

    } catch (error) {
        // Tratamento de erro mais robusto
        console.error(`[Servidor] Erro ao buscar previsão para "${cidade}":`, error.response?.data || error.message);
        const status = error.response?.status || 500;
        // Tenta pegar a mensagem de erro da resposta da API ou usa uma genérica
        const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo no servidor.';

        // Se o erro for 404 (cidade não encontrada), a mensagem geralmente já vem da API
        if (status === 404 && error.response?.data?.message) {
             res.status(status).json({ error: error.response.data.message });
        } else {
             res.status(status).json({ error: message });
        }

    }
});

// --- Novos Endpoints GET para os Dados Mockados ---

// Endpoint para obter a lista de Veículos em Destaque
app.get('/api/garagem/veiculos-destaque', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/veiculos-destaque`);
    // Retorna o array completo de veículos em destaque
    res.json(veiculosDestaque);
});

// Endpoint para obter a lista de Serviços Oferecidos
app.get('/api/garagem/servicos-oferecidos', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/servicos-oferecidos`);
    // Retorna o array completo de serviços
    res.json(servicosGaragem);
});

// Endpoint para obter a lista de Ferramentas Essenciais
app.get('/api/garagem/ferramentas-essenciais', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/ferramentas-essenciais`);
    // Retorna o array completo de ferramentas
    res.json(ferramentasEssenciais);
});

// (Opcional) Endpoint para obter um Serviço específico por ID
app.get('/api/garagem/servicos-oferecidos/:idServico', (req, res) => {
    const { idServico } = req.params;
    console.log(`[Servidor] Requisição GET para serviço com ID: ${idServico}`);

    const servico = servicosGaragem.find(s => s.id === idServico);

    if (servico) {
        res.json(servico);
    } else {
        // Se não encontrar, retorna status 404 Not Found
        res.status(404).json({ error: `Serviço com ID ${idServico} não encontrado.` });
    }
});

// --- Fim Novos Endpoints GET ---

// Opcional: Rota básica para a raiz do servidor para verificar se está rodando
app.get('/', (req, res) => {
    res.send('Servidor backend da Garagem Inteligente rodando!');
});


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});
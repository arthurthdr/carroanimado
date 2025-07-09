// =======================================================================
// ===                    GARAGEM INTELIGENTE - BACKEND                  ===
// =======================================================================

// --- Importações de Módulos ---
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';

// --- Configuração Inicial ---
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

// --- Declaração de Constantes da Aplicação (FEITA UMA ÚNICA VEZ) ---
const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY;
const mongoUriCrud = process.env.MONGO_URI_CRUD;

// =======================================================================
// --- Conexão com o Banco de Dados (MongoDB Atlas) ---
// =======================================================================

async function connectCrudDB() {
    if (mongoose.connections[0].readyState) {
        console.log("✅ Mongoose já está conectado.");
        return;
    }
    if (!mongoUriCrud) {
        console.error("❌ ERRO FATAL: A variável de ambiente MONGO_URI_CRUD não está definida!");
        return;
    }
    try {
        console.log("⏳ Conectando ao MongoDB Atlas...");
        await mongoose.connect(mongoUriCrud);
        console.log("🚀 Conectado ao MongoDB Atlas (CRUD) com sucesso!");
    } catch (err) {
        console.error("❌ ERRO FATAL ao tentar conectar ao MongoDB (CRUD):", err.message);
    }
}

// Inicia a conexão com o banco de dados assim que o servidor é iniciado.
connectCrudDB();

// =======================================================================
// --- Middlewares ---
// =======================================================================

// Middleware para permitir CORS (acesso de outras origens, como o seu frontend)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// =======================================================================
// --- Banco de Dados Mockado (Dados de Exemplo) ---
// =======================================================================

const dicasManutencaoGerais = [
    { id: 1, dica: "Verifique o nível do óleo do motor regularmente." },
    { id: 2, dica: "Calibre os pneus semanalmente para maior segurança e economia." },
    { id: 3, dica: "Confira o fluido de arrefecimento (radiador) com o motor frio." }
];

const dicasPorTipo = {
    carro: [{ id: 10, dica: "Faça o rodízio dos pneus a cada 10.000 km." }],
    moto: [{ id: 20, dica: "Lubrifique a corrente frequentemente." }],
    caminhao: [{ id: 30, dica: "Inspecione o sistema de freios a ar." }]
};

const veiculosDestaque = [
    { id: 1, modelo: "Ford Maverick Híbrido", ano: 2024, destaque: "Economia e Estilo", imagemUrl: "img/maverick_mock.jpg" },
    { id: 2, modelo: "VW Kombi Elétrica ID.Buzz", ano: 2025, destaque: "Nostalgia Eletrificada", imagemUrl: "img/kombi_mock.jpg" }
];

const servicosGaragem = [
    { id: "svc001", nome: "Diagnóstico Eletrônico Completo", descricao: "Verificação detalhada de sistemas eletrônicos.", precoEstimado: "R$ 250,00" },
    { id: "svc002", nome: "Alinhamento e Balanceamento 3D", descricao: "Ajuste preciso para direção segura.", precoEstimado: "R$ 180,00" }
];

const ferramentasEssenciais = [
    { id: "fer01", nome: "Chave de Roda Cruz", utilidade: "Troca rápida de pneus." },
    { id: "fer02", nome: "Macaco Hidráulico", utilidade: "Elevação segura do veículo." }
];

// =======================================================================
// --- Rotas da API (Endpoints) ---
// =======================================================================

// Endpoint para Previsão do Tempo
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;
    if (!apiKey) return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
    if (!cidade) return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        res.json(apiResponse.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo.';
        res.status(status).json({ error: message });
    }
});

// Endpoint para Dicas de Manutenção Gerais
app.get('/api/dicas-manutencao', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/dicas-manutencao`);
    res.json(dicasManutencaoGerais);
});

// Endpoint para Dicas de Manutenção por Tipo de Veículo
app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => {
    const { tipoVeiculo } = req.params;
    console.log(`[Servidor] Requisição GET para dicas do tipo: ${tipoVeiculo}`);
    const dicas = dicasPorTipo[tipoVeiculo.toLowerCase()];
    if (dicas) {
        res.json(dicas);
    } else {
        res.status(404).json({ error: `Nenhuma dica específica encontrada para o tipo: ${tipoVeiculo}` });
    }
});

// Endpoint para Veículos em Destaque
app.get('/api/garagem/veiculos-destaque', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/veiculos-destaque`);
    res.json(veiculosDestaque);
});

// Endpoint para Serviços Oferecidos
app.get('/api/garagem/servicos-oferecidos', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/servicos-oferecidos`);
    res.json(servicosGaragem);
});

// Endpoint para Ferramentas Essenciais
app.get('/api/garagem/ferramentas-essenciais', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/ferramentas-essenciais`);
    res.json(ferramentasEssenciais);
});

// Rota raiz para verificar se o servidor está online
app.get('/', (req, res) => {
    res.send('Servidor backend da Garagem Inteligente está rodando!');
});

// =======================================================================
// --- Inicialização do Servidor ---
// =======================================================================

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});
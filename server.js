// =======================================================================
// ===                    GARAGEM INTELIGENTE - BACKEND                  ===
// =======================================================================

// --- Importações de Módulos ---
import fs from 'fs';
import path from 'path';

console.log('--- Início da Depuração de Caminhos ---');
console.log('Diretório de trabalho atual:', process.cwd());

const modelsPath = path.join(process.cwd(), 'models');
console.log('Tentando ler o diretório:', modelsPath);

try {
    const files = fs.readdirSync(modelsPath);
    console.log('Arquivos encontrados na pasta "models":', files);
} catch (error) {
    console.error('ERRO ao ler a pasta "models":', error.message);
}

console.log('--- Fim da Depuração ---');

import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import Veiculo from './models/Veiculo.js';
import Manutencao from './models/Manutencao.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authMiddleware from './middleware/auth.js';

// --- Configuração Inicial do dotenv com depuração ---
const dotEnvResult = dotenv.config();
if (dotEnvResult.error) {
    // Se houver um erro ao carregar o .env, ele será mostrado aqui.
    console.error("❌ Erro ao carregar o arquivo .env:", dotEnvResult.error);
}

// Para depuração: Imprime as variáveis que o dotenv conseguiu ler do arquivo .env.
// Se aqui aparecer 'undefined' ou um objeto vazio, o dotenv não encontrou o arquivo.
console.log("Conteúdo lido do .env:", dotEnvResult.parsed);

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
    // Esta verificação agora vai funcionar, pois as variáveis foram lidas acima.
    if (!mongoUriCrud) {
        console.error("❌ ERRO FATAL: A variável de ambiente MONGO_URI_CRUD não está definida ou não foi carregada. Verifique o arquivo .env e os logs acima.");
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
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // <--- Ordem correta
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    next(); // <--- CHAMADO POR ÚLTIMO
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
// no arquivo: server.js

// =======================================================================
// --- ROTAS DE AUTENTICAÇÃO (REGISTRO E LOGIN) ---
// =======================================================================

// --- ROTA DE REGISTRO ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validar se os dados foram enviados
        if (!email || !password) {
            return res.status(400).json({ error: 'Por favor, forneça e-mail e senha.' });
        }

        // 2. Verificar se o usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }

        // 3. Criptografar a senha (a mágica do bcrypt)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Criar o novo usuário
        const newUser = new User({
            email,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// --- ROTA DE LOGIN ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validar se os dados foram enviados
        if (!email || !password) {
            return res.status(400).json({ error: 'Por favor, forneça e-mail e senha.' });
        }

        // 2. Encontrar o usuário
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
        }

        // 3. Comparar as senhas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
        }

        // 4. Se tudo estiver certo, criar a "chave mágica" (Token JWT)
        const payload = {
            userId: user._id
        };

        // 'SEGREDO_SUPER_SECRETO' deve ser trocado por uma variável de ambiente!
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'SEGREDO_SUPER_SECRETO', {
            expiresIn: '1h' // O token expira em 1 hora
        });

        res.status(200).json({ token });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});



// ROTA PARA ADICIONAR UMA NOVA MANUTENÇÃO
app.post('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const { descricaoServico, custo, quilometragem } = req.body;

        // Validação extra: o veículo existe?
        const veiculo = await Veiculo.findById(veiculoId);
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado para adicionar manutenção.' });
        }

        // Cria a nova manutenção no banco de dados, já associada ao veículo
        const novaManutencao = await Manutencao.create({
            descricaoServico,
            custo,
            quilometragem,
            veiculo: veiculoId
        });

        res.status(201).json(novaManutencao);

    } catch (error) {
        console.error("Erro ao adicionar manutenção:", error);
        // Tratamento de erro de validação do Mongoose
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao adicionar manutenção.' });
    }
});

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

app.get('/api/dicas-manutencao', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/dicas-manutencao`);
    res.json(dicasManutencaoGerais);
});

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

app.get('/api/garagem/veiculos-destaque', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/veiculos-destaque`);
    res.json(veiculosDestaque);
});

app.get('/api/garagem/servicos-oferecidos', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/servicos-oferecidos`);
    res.json(servicosGaragem);
});

app.get('/api/garagem/ferramentas-essenciais', (req, res) => {
    console.log(`[Servidor] Requisição GET para /api/garagem/ferramentas-essenciais`);
    res.json(ferramentasEssenciais);
});

app.get('/', (req, res) => {
    res.send('Servidor backend da Garagem Inteligente está rodando!');
});

app.post('/api/veiculos', async (req, res) => {
    try {
        // Precisamos do body-parser do Express para ler o req.body
        const novoVeiculoData = req.body;
        
        console.log('[Servidor] Recebido para criar:', novoVeiculoData);

        // Usamos nosso modelo para criar o veículo no banco de dados.
        // O Mongoose vai validar os dados automaticamente usando o Schema!
        const veiculoCriado = await Veiculo.create(novoVeiculoData);

        console.log('[Servidor] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado); // 201 = Criado com sucesso

    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);

        // Tratamento de erros específicos do Mongoose
        if (error.code === 11000) { // Erro de placa duplicada
            return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        }
        if (error.name === 'ValidationError') { // Erros de campos obrigatórios, etc.
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        // Erro genérico
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

app.get('/api/veiculos', async (req, res) => {
    try {
        // Usamos o .find() sem argumentos para buscar todos os documentos da coleção.
        const todosOsVeiculos = await Veiculo.find();
        
        console.log('[Servidor] Buscando todos os veículos do DB.');
        res.json(todosOsVeiculos); // Retorna a lista de veículos em formato JSON

    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

app.put('/api/veiculos/:id', async (req, res) => {
    try {
        const veiculoId = req.params.id; // Pega o ID da URL
        const dadosAtualizados = req.body; // Pega os novos dados do corpo da requisição

        console.log(`[Servidor] Recebido para atualizar ID ${veiculoId} com:`, dadosAtualizados);

        // Encontra e atualiza o veículo no banco de dados
        const veiculoAtualizado = await Veiculo.findByIdAndUpdate(
            veiculoId, 
            dadosAtualizados,
            { new: true, runValidators: true } // Opções importantes!
        );

        if (!veiculoAtualizado) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }

        console.log('[Servidor] Veículo atualizado com sucesso:', veiculoAtualizado);
        res.status(200).json(veiculoAtualizado); // 200 = OK

    } catch (error) {
        console.error("[Servidor] Erro ao atualizar veículo:", error);
        if (error.name === 'CastError') {
             return res.status(400).json({ error: 'ID do veículo em formato inválido.' });
        }
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao atualizar veículo.' });
    }
});

app.delete('/api/veiculos/:id', async (req, res) => {
    try {
        const veiculoId = req.params.id;
        console.log(`[Servidor] Recebido para deletar ID: ${veiculoId}`);

        const veiculoDeletado = await Veiculo.findByIdAndDelete(veiculoId);

        if (!veiculoDeletado) {
            return res.status(404).json({ error: 'Veículo não encontrado para deletar.' });
        }

        console.log('[Servidor] Veículo deletado com sucesso:', veiculoDeletado);
        res.status(200).json({ message: 'Veículo deletado com sucesso!' });

    } catch (error) {
        console.error("[Servidor] Erro ao deletar veículo:", error);
         if (error.name === 'CastError') {
             return res.status(400).json({ error: 'ID do veículo em formato inválido.' });
        }
        res.status(500).json({ error: 'Erro interno ao deletar veículo.' });
    }
});

app.get('/api/veiculos/:id', async (req, res) => {
    try {
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        res.json(veiculo);
    } catch (error) {
        console.error("Erro ao buscar veículo por ID:", error);
        res.status(500).json({ error: 'Erro interno ao buscar o veículo.' });
    }
});


// ROTA PARA LISTAR AS MANUTENÇÕES (Buscar os pedidos da mesa)
app.get('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;

        // (Opcional, mas bom) O garçom verifica se a mesa existe antes de procurar.
        const veiculo = await Veiculo.findById(veiculoId);
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }

        // Busca todos os pedidos que têm o "barbante" amarrado a esta mesa.
        // E organiza do mais novo para o mais antigo.
        const manutenções = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });

        // Entrega a lista de pedidos.
        res.status(200).json(manutenções);

    } catch (error) {
        console.error("Erro ao listar manutenções:", error);
        res.status(500).json({ error: 'Erro interno ao listar manutenções.' });
    }
});

app.post('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        const novoVeiculoData = {
            ...req.body,
            // O ID do dono vem do guardião, não do frontend!
            owner: req.userId 
        };
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        // ... seu tratamento de erro ...
    }
});

app.get('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        // Busca apenas os veículos cujo dono é o usuário logado
        const todosOsVeiculos = await Veiculo.find({ owner: req.userId });
        res.json(todosOsVeiculos);
    } catch (error) {
        // ... seu tratamento de erro ...
    }
});

// FAÇA O MESMO PARA AS ROTAS PUT, DELETE E AS ROTAS DE MANUTENÇÃO!
// Sempre adicione `authMiddleware` depois da URL e antes da função async.

// Exemplo para deletar
app.delete('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        const veiculo = await Veiculo.findOne({ _id: req.params.id, owner: req.userId });
        if(!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado ou você não tem permissão.' });
        }
        await Veiculo.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Veículo deletado com sucesso!' });
    } catch (error) {
        // ... seu tratamento de erro ...
    }
});

// =======================================================================
// --- Inicialização do Servidor ---
// =======================================================================

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});
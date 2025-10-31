// =======================================================================
// ===                    GARAGEM INTELIGENTE - BACKEND                  ===
// =======================================================================

// --- Importações de Módulos ---
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import cors from 'cors';
import Veiculo from './models/Veiculo.js';
import Manutencao from './models/Manutencao.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authMiddleware from './middleware/auth.js';
import multer from 'multer';
import path from 'path'; 

// --- Configuração Inicial ---
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY;
const mongoUriCrud = process.env.MONGO_URI_CRUD;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Onde salvar os arquivos
  },
  filename: function (req, file, cb) {
    // Cria um nome de arquivo único para evitar sobreposição
    // Ex: 1734567890123-meu-carro.png
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });

// =======================================================================
// --- Middlewares ---
// =======================================================================
app.use(cors());
app.use(express.json());

// 3. TORNE A PASTA UPLOADS PÚBLICA
// O frontend irá acessar as imagens através de URLs como http://localhost:3001/uploads/nome-da-imagem.jpg
app.use('/uploads', express.static('uploads'));
// =======================================================================
// --- Conexão com o Banco de Dados ---
// =======================================================================

async function connectCrudDB() {
    if (!mongoUriCrud) {
        console.error("❌ ERRO FATAL: MONGO_URI_CRUD não definida.");
        return process.exit(1);
    }
    try {
        await mongoose.connect(mongoUriCrud);
        console.log("🚀 Conectado ao MongoDB Atlas com sucesso!");
    } catch (err) {
        console.error("❌ ERRO FATAL ao conectar ao MongoDB:", err.message);
        process.exit(1);
    }
}
connectCrudDB();

// =======================================================================
// --- Rotas Públicas ---
// =======================================================================

app.get('/', (req, res) => res.send('Servidor Garagem Inteligente está no ar!'));

app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;
    if (!apiKey) return res.status(500).json({ error: 'Chave da API não configurada.' });
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
    try {
        const apiResponse = await axios.get(weatherAPIUrl);
        res.json(apiResponse.data);
    } catch (error) {
        const status = error.response?.status || 500;
        res.status(status).json({ error: 'Erro ao buscar previsão do tempo.' });
    }
});

// =======================================================================
// --- Rotas de Autenticação ---
// =======================================================================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Credenciais inválidas.' });
        
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.status(200).json({ token });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// =======================================================================
// --- Rotas de Veículos (TODAS PROTEGIDAS) ---
// =======================================================================

// Substitua a sua rota POST /api/veiculos inteira por esta:

app.post('/api/veiculos', authMiddleware, upload.single('imagem'), async (req, res) => {
    console.log('\n--- [ROTA POST /api/veiculos com Upload] ---');
    console.log('[ROTA] Corpo da requisição (req.body):', req.body);
    console.log('[ROTA] Arquivo recebido (req.file):', req.file);
    console.log(`[ROTA] ID do usuário: '${req.userId}'`);

    try {
        const veiculoData = {
            ...req.body,
            owner: req.userId,
            // Se um arquivo foi enviado (req.file existe), salve seu caminho.
            // O caminho será algo como "uploads/1734567890123.png"
            imageUrl: req.file ? req.file.path.replace(/\\/g, "/") : ''
        };

        console.log('[ROTA] Objeto final para salvar no banco:', veiculoData);
        
        const veiculoCriado = await Veiculo.create(veiculoData);
        console.log('[ROTA] SUCESSO! Veículo salvo:', veiculoCriado);
        res.status(201).json(veiculoCriado);

    } catch (error) {
        console.error('[ROTA] ERRO no bloco CATCH:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ error: messages });
        }
        res.status(500).json({ error: 'Erro ao criar veículo.' });
    }
});

app.post('/api/veiculos', authMiddleware, async (req, res) => {
    // --- NOSSO NOVO ESPIÃO ---
    console.log('\n--- [ROTA POST /api/veiculos] ---');
    console.log('[ROTA] Corpo da requisição (req.body):', req.body);
    console.log(`[ROTA] ID do usuário recebido do middleware: '${req.userId}'`);
    // --- FIM DO ESPIÃO ---

    try {
        // A linha abaixo agora usa o userId que o middleware nos deu.
        const novoVeiculoData = { ...req.body, owner: req.userId };
        console.log('[ROTA] Objeto final para salvar no banco:', novoVeiculoData);

        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        console.log('[ROTA] SUCESSO! Veículo salvo:', veiculoCriado);
        res.status(201).json(veiculoCriado);

    } catch (error) {
        console.error('[ROTA] ERRO no bloco CATCH:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ error: messages });
        }
        res.status(500).json({ error: 'Erro ao criar veículo.' });
    }
});

app.get('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        const veiculo = await Veiculo.findOne({ _id: req.params.id, owner: req.userId });
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });
        res.json(veiculo);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar veículo.' });
    }
});

app.put('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        const veiculo = await Veiculo.findOneAndUpdate(
            { _id: req.params.id, owner: req.userId },
            req.body, { new: true, runValidators: true }
        );
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });
        res.json(veiculo);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar veículo.' });
    }
});

app.delete('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        const veiculo = await Veiculo.findOneAndDelete({ _id: req.params.id, owner: req.userId });
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });
        res.json({ message: 'Veículo deletado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar veículo.' });
    }
});

// =======================================================================
// --- Rotas de Manutenção (TODAS PROTEGIDAS) ---
// =======================================================================

app.get('/api/veiculos/:veiculoId/manutencoes', authMiddleware, async (req, res) => {
    try {
        const veiculo = await Veiculo.findOne({ _id: req.params.veiculoId, owner: req.userId });
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });
        const manutenções = await Manutencao.find({ veiculo: req.params.veiculoId }).sort({ data: -1 });
        res.json(manutenções);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar manutenções.' });
    }
});

app.post('/api/veiculos/:veiculoId/manutencoes', authMiddleware, async (req, res) => {
    console.log(`\n--- [ROTA POST /api/veiculos/${req.params.veiculoId}/manutencoes] ---`);
    try {
        // 1. Verifica se o veículo pertence ao usuário logado
        const veiculo = await Veiculo.findOne({ _id: req.params.veiculoId, owner: req.userId });
        if (!veiculo) {
            console.log(`[ROTA] ERRO: Veículo ${req.params.veiculoId} não encontrado ou não pertence ao usuário ${req.userId}.`);
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }

        console.log('[ROTA] Veículo encontrado. Dados da manutenção recebidos:', req.body);

        // 2. Cria a nova manutenção associando-a ao veículo
        const novaManutencao = new Manutencao({
            ...req.body,
            veiculo: req.params.veiculoId // Associa o ID do veículo
        });
        
        // 3. Salva a manutenção no banco de dados
        await novaManutencao.save();

        console.log('[ROTA] SUCESSO! Manutenção salva:', novaManutencao);
        res.status(201).json(novaManutencao); // Retorna a manutenção criada

    } catch (error) {
        console.error('[ROTA] ERRO no bloco CATCH:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ error: messages });
        }
        res.status(500).json({ error: 'Erro ao adicionar manutenção.' });
    }
});

app.post('/api/veiculos/:veiculoId/manutencoes', authMiddleware, async (req, res) => {
    try {
        const veiculo = await Veiculo.findOne({ _id: req.params.veiculoId, owner: req.userId });
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });
        const manutencao = await Manutencao.create({ ...req.body, veiculo: req.params.veiculoId });
        res.status(201).json(manutencao);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar manutenção.' });
    }
});

// =======================================================================
// --- Inicialização do Servidor ---
// =======================================================================

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
});
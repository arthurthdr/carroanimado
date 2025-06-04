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

// Opcional: Rota básica para a raiz do servidor para verificar se está rodando
app.get('/', (req, res) => {
    res.send('Servidor backend da Garagem Inteligente rodando!');
});


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});
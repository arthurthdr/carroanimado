// Importações
import express from 'express';
import dotenv from

5.  **Crie o arquivo `.env`:**
    *   Na raiz do seu projeto, crie um novo arquivo chamado `.env`.
    *   Dentro do arquivo `.env`, adicione a sua chave da OpenWeatherMap da seguinte forma:
        ```
        OPENWEATHER_API 'dotenv';
import axios from 'axios';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
const port = process.env.PORT || 3001; // Porta para o servidor backend
                                    _KEY=SUA_CHAVE_OPENWEATHERMAP_AQUI
        PORT=3001
        ```
        *   Substitua `SUA_CHAVE_OPENWEATHERMAP_AQUI` pela sua chave real.
        *   A linha `PORT=3001// Use uma porta diferente do frontend se rodar ambos localmente
const apiKey = process.env.OPENWEATHER_API_KEY;

// Middleware para permitir que o frontend (rodando em outra porta) acesse este backend
// (CORS - Cross-Origin Resource Sharing)
app.use((` define a porta que o servidor backend usará.

6.  **Adicione `.env` e `node_modules/` ao `.gitignore`:**
    *   Se você já tem um arquivo `.gitignore` no seu projeto, adicione as linhas `.env` e `node_modules/` aoreq, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Em produção, restrinja para o seu domínio frontend
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept final dele. Se não tiver, crie um arquivo chamado `.gitignore` na raiz do seu projeto e adicione essas linhas.
        *   Isso garante que você não envie acidentalmente sua chave da API para o GitHub e que a pasta `node_modules` (que pode ser grande) não seja');
    next();
});

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params; // Pega o parâmetro :c versionada.

**Fase 2: Construindo Seu Primeiro Endpoint**

O código do `server.js` já está completo, então não precisa fazer mais nada aqui. Ele faz o seguinte:

*   Importa os módulos necessários.
*   Carrega as variáveis do `.env`.
*   Criaidade da URL

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console a aplicação Express.
*   Define a porta onde o servidor vai rodar (3001 por padrão, mas pode ser alterada pela variável de ambiente `PORT`).
*   Cria um middleware para lidar com o CORS (permitindo que o frontend acesse o backend).
*   Define a rota `/api.log(`[Servidor] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log('[Servidor] Dados recebidos da OpenWeatherMap.');
        
        // Apenas para ver a estrutura completa da API no console/previsao/:cidade` que irá receber as requisições do frontend.
*   Dentro da rota, ele busca a cidade da URL, valida se a chave da API está presente e se a cidade foi informada.
*   Faz a requisição para a OpenWeatherMap usando o `axios`.
 do servidor pela primeira vez
        // console.log(JSON.stringify(apiResponse.data, null, 2));

        // Enviamos a resposta da API OpenWeatherMap diretamente para o nosso frontend
        res.json(apiResponse.data);

    } catch (error) {
        *   Envia a resposta da OpenWeatherMap (ou um erro) de volta para o frontend como JSON.

**Fase 3: Conectando o Frontend ao Novo Backend**

1.  **Abra o arquivo `js/script.js`:**
    *   Localize a função `console.error("[Servidor] Erro ao buscar previsão:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo no servidor.';
        buscarPrevisaoDetalhada(cidade)`.

2.  **Remova a API Key do Frontend:**
    *   Apague a linha `const apiKey = "SUA_CHAVE_API";` dentro da função (ou qualquer linha onde você tenha definido a chave da API no frontend).

res.status(status).json({ error: message });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});
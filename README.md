# Projeto Garagem Inteligente

Este é o projeto da Garagem Inteligente desenvolvido como parte do curso de Informática para Internet no IFPR.

## Descrição do Projeto

A Garagem Inteligente permite gerenciar diferentes tipos de veículos, visualizar seus detalhes, histórico de manutenção e planejar viagens com base na previsão do tempo.

## Novidades desta Atividade (B2.P1.A5 - Ponte para o Backend)

Nesta fase, foi implementado um servidor backend utilizando Node.js e Express para atuar como um proxy seguro para a API OpenWeatherMap. Isso garante que a chave de API da OpenWeatherMap não fique exposta no código frontend que roda no navegador.

O fluxo da aplicação agora é: Frontend (Navegador) -> Nosso Backend (Node.js) -> API OpenWeatherMap -> Nosso Backend -> Frontend.

## Requisitos para Rodar

*   Node.js e npm instalados.
*   Uma chave de API da OpenWeatherMap.

## Configuração

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/arthurthdr/carroanimado
    cd carro
    ```

2.  **Crie o Arquivo `.env`:** Na raiz do projeto, crie um arquivo chamado `.env` e adicione sua chave da OpenWeatherMap:
    ```dotenv
    OPENWEATHER_API_KEY=b35a17a87dd4682376499cc8ba4658abI
    PORT=3001
    ```

3.  **Instale as Dependências do Backend:** No terminal, na pasta raiz do projeto, execute:
    ```bash
    npm install
    ```

## Como Rodar a Aplicação

Para rodar a aplicação completa, você precisa iniciar o servidor backend e depois abrir o frontend.

1.  **Inicie o Backend:** No terminal, na pasta raiz do projeto, execute:
    ```bash
    node server.js
    ```
    Este comando iniciará o servidor backend, que ficará escutando na porta 3001 (ou na porta definida na variável `PORT` do `.env`). Mantenha este terminal aberto.

2.  **Abra o Frontend:** Em um navegador web, abra o arquivo `index.html` que está na raiz do projeto. (Alternativamente, se você usa um servidor local para o frontend, inicie-o em outro terminal).

Agora, o frontend no seu navegador se comunicará com o backend rodando localmente para obter a previsão do tempo.

## Endpoint do Backend

O backend expõe o seguinte endpoint para buscar a previsão do tempo:

*   **GET `/api/previsao/:cidade`**
    *   **Descrição:** Busca a previsão do tempo detalhada (forecast) para a cidade especificada.
    *   **Parâmetros de Rota:** `:cidade` (string, nome da cidade)
    *   **Resposta de Sucesso (200 OK):** Retorna um objeto JSON com os dados do forecast da OpenWeatherMap.
    *   **Resposta de Erro (400 Bad Request):** `{ "error": "Nome da cidade é obrigatório." }`
    *   **Resposta de Erro (401 Unauthorized / 500 Internal Server Error):** `{ "error": "Mensagem de erro..." }` (Erros na chave da API ou na comunicação com a OpenWeatherMap são tratados e retornados aqui).

## Estrutura do Projeto
garagem-inteligente/
├── css/
│ └── style.css
├── js/
│ ├── classes/
│ │ ├── ... (Arquivos das classes de veículos e Manutencao)
│ │ └── Veiculo.js
│ └── script.js <-- Modificado para chamar o backend
├── img/
├── sounds/
├── index.html
├── .env <-- NOVO (ou atualizado) - Chave de API segura
├── .gitignore <-- NOVO (ou atualizado) - Ignora .env e node_modules
├── package.json <-- NOVO (criado por npm init -y, ou manualmente)
├── package-lock.json <-- NOVO (criado por npm install)
└── server.js <-- NOVO - O código do backend
└── README.md <-- ESTE ARQUIVO

## Critérios de Avaliação (Auto-Verificação)

*   [ ] Servidor Backend Funcional (server.js)
*   [ ] Endpoint `/api/previsao/:cidade` implementado
*   [ ] Chave OpenWeatherMap carregada do `.env` no backend (NÃO no frontend!)
*   [ ] Backend faz a requisição HTTP para a OpenWeatherMap (usando axios)
*   [ ] Frontend ajustado para chamar `http://localhost:3001/api/previsao/...`
*   [ ] Erros tratados no backend e comunicados ao frontend
*   [ ] README.md atualizado com instruções e nova arquitetura
*   [ ] (Bônus) Deploy funcional (frontend + backend)

---
Desenvolvido por: Arthur (e a ajuda do assistente de IA!)
Curso: Informática para Internet - IFPR
Ano: 2024
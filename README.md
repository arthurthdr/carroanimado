# Projeto Garagem Inteligente

Este é o projeto da Garagem Inteligente desenvolvido como parte do curso de Informática para Internet no IFPR, por Arthur.

## Descrição do Projeto

A Garagem Inteligente é uma aplicação web full-stack que permite o gerenciamento completo de uma frota de veículos. O sistema utiliza um frontend em HTML, CSS e JavaScript para interação do usuário e um backend em Node.js com Express e Mongoose para persistir os dados em um banco de dados MongoDB Atlas.

Funcionalidades principais incluem:
*   Adicionar, listar, editar e remover veículos da garagem (CRUD completo).
*   Consultar a previsão do tempo para planejar viagens.

## Links Públicos

*   **Frontend (Vercel):** [https://carroanimado.vercel.app/](https://carroanimado.vercel.app/)
*   **Backend (Render):** [https://carroanimado-1.onrender.com/](https://carroanimado-1.onrender.com/)

## Como Rodar Localmente

### Pré-requisitos
*   Node.js e npm instalados.
*   Uma chave de API da [OpenWeatherMap](https://openweathermap.org/api).
*   Uma string de conexão do [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Configuração

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/arthurthdr/carroanimado
    cd carroanimado
    ```

2.  **Instale as Dependências do Backend:**
    ```bash
    npm install
    ```

3.  **Crie o Arquivo `.env`:** Na raiz do projeto, crie um arquivo chamado `.env` e adicione suas variáveis:
    ```dotenv
    # Chave da API para previsão do tempo
    OPENWEATHER_API_KEY=sua_chave_aqui_da_openweathermap
    
    # String de conexão do seu cluster MongoDB Atlas
    MONGO_URI_CRUD=sua_string_de_conexao_aqui
    
    # Porta para o servidor backend rodar localmente
    PORT=3001
    ```

### Execução

1.  **Inicie o Servidor Backend:** No terminal, execute:
    ```bash
    node server.js
    ```
    O servidor estará rodando em `http://localhost:3001`. Mantenha este terminal aberto.

2.  **Abra o Frontend:** Abra o arquivo `index.html` em um navegador web. A aplicação frontend se conectará automaticamente ao backend local.

---

## Documentação da API

### API da Garagem (CRUD com MongoDB)

Estes endpoints interagem diretamente com a coleção de veículos no banco de dados.

#### Listar Todos os Veículos
*   **Endpoint:** `GET /api/veiculos`
*   **Descrição:** Retorna uma lista com todos os veículos atualmente na garagem.
*   **Resposta de Sucesso (200 OK):** Um array de objetos de veículo.

#### Buscar um Veículo Específico
*   **Endpoint:** `GET /api/veiculos/:id`
*   **Descrição:** Retorna os detalhes de um único veículo, identificado pelo seu `_id`.
*   **Parâmetros de Rota:** `:id` (o ID do veículo no MongoDB).
*   **Resposta de Sucesso (200 OK):** O objeto completo do veículo.

#### Criar um Novo Veículo
*   **Endpoint:** `POST /api/veiculos`
*   **Descrição:** Adiciona um novo veículo à garagem.
*   **Corpo da Requisição (Body):** Um objeto JSON com os dados do veículo.
    ```json
    {
      "placa": "ABC1D23",
      "marca": "Fiat",
      "modelo": "Mobi",
      "ano": 2024,
      "cor": "Branco"
    }
    ```
*   **Resposta de Sucesso (201 Created):** O objeto do veículo recém-criado, incluindo o `_id` do banco de dados.

#### Atualizar um Veículo Existente
*   **Endpoint:** `PUT /api/veiculos/:id`
*   **Descrição:** Modifica os dados de um veículo específico.
*   **Parâmetros de Rota:** `:id` (o ID do veículo no MongoDB).
*   **Corpo da Requisição (Body):** Um objeto JSON com os campos a serem atualizados. Ex: `{ "cor": "Vermelho Metálico" }`
*   **Resposta de Sucesso (200 OK):** O objeto completo do veículo após a atualização.

#### Excluir um Veículo
*   **Endpoint:** `DELETE /api/veiculos/:id`
*   **Descrição:** Remove permanentemente um veículo da garagem.
*   **Parâmetros de Rota:** `:id` (o ID do veículo no MongoDB).
*   **Resposta de Sucesso (200 OK):** Uma mensagem de confirmação. Ex: `{ "message": "Veículo deletado com sucesso!" }`

---

### APIs de Informações Adicionais (Dados Mockados)

Estes endpoints fornecem dados de exemplo que estão fixos no código do `server.js`.

#### Previsão do Tempo
*   **`GET /api/previsao/:cidade`**
    *   **Descrição:** Atua como um proxy seguro para a API de forecast da OpenWeatherMap, protegendo sua chave de API.
    *   **Parâmetros de Rota:** `:cidade` (string, nome da cidade).
    *   **Resposta (Sucesso):** Objeto JSON com os dados da previsão da OpenWeatherMap.

#### Dicas de Manutenção
*   **`GET /api/dicas-manutencao`**: Retorna uma lista de dicas de manutenção gerais.
*   **`GET /api/dicas-manutencao/:tipoVeiculo`**: Retorna dicas específicas para "carro", "moto" ou "caminhao".

#### Outros Dados da Garagem
*   **`GET /api/garagem/veiculos-destaque`**: Retorna uma lista de veículos em destaque.
*   **`GET /api/garagem/servicos-oferecidos`**: Retorna a lista de serviços oferecidos pela garagem.
*   **`GET /api/garagem/ferramentas-essenciais`**: Retorna uma lista de ferramentas essenciais.
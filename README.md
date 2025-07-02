# Projeto Garagem Inteligente

Este é o projeto da Garagem Inteligente desenvolvido como parte do curso de Informática para Internet no IFPR, por Arthur.

## Descrição do Projeto

A Garagem Inteligente é uma aplicação web completa com frontend e backend. Ela permite gerenciar uma frota de veículos (carros, motos, caminhões), simular suas ações (ligar, acelerar), registrar manutenções e planejar viagens consultando a previsão do tempo.

O projeto utiliza um frontend em HTML, CSS e JavaScript puro (com POO) e um backend em Node.js com Express, que serve como uma API para fornecer dados da aplicação (veículos em destaque, serviços, dicas) e como um proxy seguro para APIs externas (OpenWeatherMap).

## Links Públicos

*   **Frontend (Vercel):** [https://carroanimado.vercel.app/](https://carroanimado.vercel.app/)  <-- *Verifique se este é seu link correto!*
*   **Backend (Render):** [https://carroanimado-1.onrender.com/](https://carroanimado-1.onrender.com/) <-- *Verifique se este é seu link correto!*

## Como Rodar Localmente

### Pré-requisitos
*   Node.js e npm instalados.
*   Uma chave de API da [OpenWeatherMap](https://openweathermap.org/api).

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
    # Substitua pelo sua chave da API OpenWeatherMap
    OPENWEATHER_API_KEY=sua_chave_aqui
    
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

## Documentação da API do Backend

O backend expõe os seguintes endpoints GET:

---

### Previsão do Tempo

*   **`GET /api/previsao/:cidade`**
    *   **Descrição:** Atua como um proxy para a API de forecast da OpenWeatherMap.
    *   **Parâmetros de Rota:** `:cidade` (string, nome da cidade).
    *   **Resposta (Sucesso):** Objeto JSON com os dados da previsão da OpenWeatherMap.
    *   **Resposta (Erro):** Objeto JSON `{ "error": "mensagem de erro" }` com status 400, 404 ou 500.

---

### Dicas de Manutenção

*   **`GET /api/dicas-manutencao`**
    *   **Descrição:** Retorna uma lista de dicas de manutenção gerais para qualquer veículo.
    *   **Resposta (Sucesso):** Array de objetos. Exemplo:
        ```json
        [
            { "id": 1, "dica": "Verifique o nível do óleo do motor regularmente." },
            { "id": 2, "dica": "Calibre os pneus semanalmente..." }
        ]
        ```

*   **`GET /api/dicas-manutencao/:tipoVeiculo`**
    *   **Descrição:** Retorna dicas de manutenção específicas para um tipo de veículo.
    *   **Parâmetros de Rota:** `:tipoVeiculo` (string, ex: `carro`, `moto`, `caminhao`).
    *   **Resposta (Sucesso):** Array de objetos com dicas específicas. Exemplo para `/api/dicas-manutencao/moto`:
        ```json
        [
            { "id": 20, "dica": "Lubrifique e ajuste a tensão da corrente a cada 500 km." }
        ]
        ```
    *   **Resposta (Erro 404):** Objeto JSON `{ "error": "Nenhuma dica específica encontrada..." }` se o tipo não existir.

---

### Dados da Garagem

*   **`GET /api/garagem/veiculos-destaque`**
    *   **Descrição:** Retorna uma lista de veículos em destaque.
    *   **Resposta (Sucesso):** Array de objetos. Exemplo:
        ```json
        [
            { "id": 1, "modelo": "Ford Maverick Híbrido", "ano": 2024, "destaque": "Economia e Estilo", "imagemUrl": "..." }
        ]
        ```

*   **`GET /api/garagem/servicos-oferecidos`**
    *   **Descrição:** Retorna a lista de serviços oferecidos pela garagem.
    *   **Resposta (Sucesso):** Array de objetos. Exemplo:
        ```json
        [
            { "id": "svc001", "nome": "Diagnóstico Eletrônico Completo", "descricao": "...", "precoEstimado": "R$ 250,00" }
        ]
        ```

*   **`GET /api/garagem/ferramentas-essenciais`**
    *   **Descrição:** Retorna uma lista de ferramentas essenciais para manutenção.
    *   **Resposta (Sucesso):** Array de objetos. Exemplo:
        ```json
        [
            { "id": "fer01", "nome": "Chave de Roda Cruz", "utilidade": "Troca rápida de pneus.", "linkCompra": "..." }
        ]
        ```

---
# Plano de Caça-Fantasmas - Garagem Inteligente

## Prioridade Alta (Bugs Críticos)

- [ ] **Problema:** Registrar uma nova manutenção não funciona. Ao preencher o formulário e clicar em "Registrar Manutenção", nada acontece na lista e nenhuma mensagem de erro clara aparece para o usuário.
  - **Hipótese:** O frontend (`script.js`) está enviando a requisição `POST` para o backend, mas o servidor (`server.js`) não possui a rota (`endpoint`) para receber e processar essa requisição. Isso deve estar gerando um erro `404 Not Found` que pode ser visto nas ferramentas de desenvolvedor.
  - **Como Investigar:**
    1. Abrir a página, clicar em "Detalhes" de um veículo.
    2. Abrir as Ferramentas de Desenvolvedor do navegador (tecla F12).
    3. Ir para a aba **"Rede" (Network)**.
    4. Preencher e enviar o formulário de manutenção.
    5. Observar se uma nova linha aparece em vermelho, provavelmente com o status `404`.
    6. Verificar o `server.js` para confirmar a ausência da rota `app.post('/api/veiculos/:veiculoId/manutencoes')`.

- [ ] **Problema:** A funcionalidade de previsão do tempo não está visível na página. O código para ela existe no `script.js`, mas os campos para digitar a cidade e o botão não aparecem no `index.html`.
  - **Hipótese:** O bloco HTML correspondente à previsão do tempo foi removido ou esquecido no arquivo `index.html`. O JavaScript tenta encontrar os elementos, mas não os acha, e por isso a funcionalidade não é ativada.
  - **Como Investigar:**
    1. Inspecionar o arquivo `index.html` e procurar por elementos com os IDs `destino-viagem`, `verificar-clima-btn` e `previsao-tempo-resultado`.
    2. Verificar o `script.js` e ver que ele de fato procura por esses IDs. A ausência deles no HTML confirma a hipótese.

## Prioridade Média (Melhorias de UX)

- [ ] **Problema:** As informações na janela de "Detalhes do Veículo" são muito básicas. Seria mais útil se mostrasse dados adicionais, como o valor da tabela FIPE ou informações sobre recall, conforme sugerido nos dados da API mockada (`dados_veiculos_api.json`).
  - **Hipótese:** O backend salva apenas os dados básicos do veículo. A lógica para incluir e salvar os dados adicionais precisa ser implementada no `server.js`, e a função `handleMostrarDetalhes` no `script.js` precisa ser atualizada para exibir esses novos campos.
  - **Como Investigar:**
    1. Analisar o `models/Veiculo.js` para ver que campos como `valorFIPE` não existem no Schema.
    2. Verificar a rota `POST /api/veiculos` no `server.js` e notar que ela não adiciona nenhuma informação extra.
    3. Olhar a função `handleMostrarDetalhes` no `script.js` e confirmar que ela só exibe os campos básicos.

## Prioridade Baixa (Limpeza de Código)

- [ ] **Problema:** O projeto contém arquivos de um sistema antigo de classes (ex: `Carro.js`, `Veiculo.js`, `Moto.js`) que não estão sendo utilizados no `index.html` atual, que funciona com base em um backend.
  - **Hipótese:** Esses arquivos são de uma versão anterior do projeto e foram mantidos no repositório, causando confusão sobre qual é a lógica real da aplicação.
  - **Como Investigar:**
    1. Abrir o `index.html` e verificar que ele importa apenas o `js/script.js`.
    2. Notar que o `script.js` não faz nenhuma referência ou uso das classes `Carro`, `Moto`, etc.
/**
 * @file script.js
 * @description Lógica principal da Garagem Inteligente (versão com Banco de Dados).
 * @author Arthur
 */



// ===================================================================================
// Bloco de Configuração e Variáveis Globais
// ===================================================================================

const RENDER_BACKEND_URL = 'https://carroanimado.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:3001';

const backendUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? LOCAL_BACKEND_URL   // Se for local, usa este
    : RENDER_BACKEND_URL; // Senão (online), usa este

// Mensagem no console para sabermos para onde estamos tentando conectar.
console.log(`[CONFIG] Frontend conectando ao backend em: ${backendUrl}`);
// Elementos DOM (cacheados para melhor performance)
const notificacoesContainer = document.getElementById('notificacoes');
const garagemContainer = document.getElementById('garagem-container');
const btnMostrarFormAdd = document.getElementById('mostrar-form-add');
const addVeiculoFormContainer = document.getElementById('add-veiculo-form-container');
const formAddVeiculo = document.getElementById('form-add-veiculo');
const btnCancelarAdd = document.getElementById('cancelar-add-veiculo');
const destinoViagemInput = document.getElementById('destino-viagem');
const verificarClimaBtn = document.getElementById('verificar-clima-btn');
const previsaoTempoResultado = document.getElementById('previsao-tempo-resultado');
const detalhesContainer = document.getElementById('detalhes-e-agendamento');
const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
const btnFecharDetalhes = document.getElementById('fechar-detalhes');
const formAddManutencao = document.getElementById('form-add-manutencao'); 

// ===================================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    buscarErenderizarVeiculos();
});

// ===================================================================================
// Funções de Renderização e UI (Interface do Usuário)
// ===================================================================================

async function buscarErenderizarVeiculos() {
    if (!garagemContainer) return;
    try {
        const response = await fetch(`${backendUrl}/api/veiculos`);
        if (!response.ok) throw new Error('Falha ao buscar veículos do servidor.');
        const veiculosDoBanco = await response.json();
        garagemContainer.innerHTML = veiculosDoBanco.length > 0
            ? veiculosDoBanco.map(gerarHTMLVeiculoDoBanco).join('')
            : '<p id="garagem-vazia-msg" style="display: block;">Sua garagem está vazia. Adicione um veículo!</p>';
    } catch (error) {
        console.error('Erro ao buscar veículos:', error);
        garagemContainer.innerHTML = `<p style="color:red;">Erro ao carregar a garagem.</p>`;
        exibirNotificacao(error.message, 'erro');
    }
}

function gerarHTMLVeiculoDoBanco(veiculo) {
    return `
        <div id="${veiculo._id}" class="veiculo-container">
            <button class="remover-veiculo-btn" data-action="excluir" data-id="${veiculo._id}" title="Excluir ${veiculo.modelo}">×</button>
            <h2>${veiculo.marca} ${veiculo.modelo}</h2>
            <img src="img/carro.jpg" alt="Imagem ${veiculo.modelo}" class="veiculo-imagem" onerror="this.src='img/placeholder.png';">
            <p><strong>Placa:</strong> ${veiculo.placa}</p>
            <p><strong>Ano:</strong> ${veiculo.ano}</p>
            <p><strong>Cor:</strong> <span class="veiculo-cor">${veiculo.cor}</span></p>
            <div class="controles-veiculo">
                 <button data-action="editar" data-id="${veiculo._id}">Editar</button>
                 <button data-action="detalhes" data-id="${veiculo._id}">Detalhes</button>
            </div>
        </div>
    `;
}

function toggleFormAddVeiculo(show) {
    if (!addVeiculoFormContainer || !btnMostrarFormAdd) return;
    addVeiculoFormContainer.style.display = show ? 'block' : 'none';
    btnMostrarFormAdd.textContent = show ? 'Cancelar Adição' : 'Adicionar Novo Veículo +';
    if(show) formAddVeiculo.reset();
}

async function carregarManutencoes(veiculoId) {
    const listaManutencoes = document.getElementById('lista-manutencoes');
    if (!listaManutencoes) return;

    listaManutencoes.innerHTML = '<li>Carregando manutenções...</li>';

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${veiculoId}/manutencoes`);
        const manutenções = await response.json();

        if (!response.ok) {
            throw new Error(manutenções.error || 'Falha ao carregar manutenções.');
        }

        if (manutenções.length === 0) {
            listaManutencoes.innerHTML = '<li>Nenhuma manutenção registrada para este veículo.</li>';
        } else {
            listaManutencoes.innerHTML = manutenções.map(m => `
                <li>
                    <strong>${new Date(m.data).toLocaleDateString('pt-BR')}</strong> - 
                    ${m.descricaoServico} - 
                    R$ ${m.custo.toFixed(2)}
                    ${m.quilometragem ? `(${m.quilometragem} km)` : ''}
                </li>
            `).join('');
        }
    } catch (error) {
        console.error("Erro ao carregar manutenções:", error);
        listaManutencoes.innerHTML = `<li style="color: red;">${error.message}</li>`;
    }
}

// Função para ADICIONAR uma nova manutenção
async function adicionarManutencao(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // --- ETAPA 1: Coletar todos os dados do formulário primeiro ---
    const veiculoId = document.getElementById('manutencao-veiculo-id').value;
    const form = document.getElementById('form-add-manutencao');

    // Verificação de segurança
    if (!veiculoId) {
        exibirNotificacao('Erro: ID do veículo não encontrado. Tente abrir os detalhes novamente.', 'erro');
        return;
    }

    // Pegando os valores de cada campo
    const descricaoServico = document.getElementById('manutencao-descricao').value;
    const custoInput = document.getElementById('manutencao-custo').value;
    const kmInput = document.getElementById('manutencao-km').value;

    // --- ETAPA 2: Montar o objeto para enviar ao backend ---
    const dadosFormulario = {
        descricaoServico: descricaoServico,
        custo: parseFloat(custoInput), // Converte para número decimal
        // Se o campo de km não estiver vazio, converte para número inteiro
        quilometragem: kmInput ? parseInt(kmInput) : undefined
    };

    // --- ETAPA 3: Tentar enviar os dados ---
    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${veiculoId}/manutencoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosFormulario)
        });

        const novaManutencao = await response.json();
        
        if (!response.ok) {
            throw new Error(novaManutencao.error || 'Falha ao registrar manutenção.');
        }

        exibirNotificacao('Manutenção registrada com sucesso!', 'sucesso');
        form.reset(); // Limpa o formulário

        // Atualiza a lista na tela (NOME DA FUNÇÃO CORRIGIDO)
        await carregarManutencoes(veiculoId);

    } catch (error) {
        console.error("Erro ao adicionar manutenção:", error);
        exibirNotificacao(error.message, 'erro');
    }
}

// ===================================================================================
// Funções de Ação e Eventos
// ===================================================================================

// D:/carro/js/script.js

function setupEventListeners() {

    // --- Listeners dos botões principais ---
    btnMostrarFormAdd?.addEventListener('click', () => toggleFormAddVeiculo(addVeiculoFormContainer.style.display === 'none'));
    btnCancelarAdd?.addEventListener('click', () => toggleFormAddVeiculo(false));
    formAddVeiculo?.addEventListener('submit', handleAddVeiculoSubmit);

    // Listener do botão de verificar clima
    verificarClimaBtn?.addEventListener('click', handleVerificarClimaClick);

    // Quando o formulário de manutenção for enviado, chame a função adicionarManutencao
    formAddManutencao?.addEventListener('submit', adicionarManutencao);

    // --- Listener para os botões DENTRO da garagem (Editar, Excluir, Detalhes) ---
    garagemContainer?.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const { action, id } = target.dataset;

        if (action === 'excluir') {
            handleExcluirVeiculo(id);
        }
        if (action === 'editar') {
            handleEditarVeiculo(id);
        }
        if (action === 'detalhes') {
            // SUBSTITUÍMOS O ALERT PELA CHAMADA DA FUNÇÃO REAL
            handleMostrarDetalhes(id); 
        }
    });

    // --- Listener para o botão de FECHAR o modal de detalhes ---
    // ADICIONAMOS ESTE NOVO LISTENER
    btnFecharDetalhes?.addEventListener('click', fecharDetalhes);
}

async function handleAddVeiculoSubmit(event) {
    event.preventDefault();

    try {
        // --- ETAPA 1: Selecionar os elementos do formulário ---
        const placaInput = document.getElementById('add-placa');
        const marcaInput = document.getElementById('add-marca');
        const modeloInput = document.getElementById('add-modelo');
        const anoInput = document.getElementById('add-ano');
        const corInput = document.getElementById('add-cor');

        // --- ETAPA 2: Verificar se todos os elementos foram encontrados ---
        // Se algum destes for 'null', o erro vai acontecer.
        if (!placaInput || !marcaInput || !modeloInput || !anoInput || !corInput) {
            // Esta mensagem nos dirá exatamente qual campo está com problema de ID
            console.error('ERRO: Um ou mais campos do formulário de adição não foram encontrados no HTML. Verifique os IDs.');
            exibirNotificacao('Erro de formulário. Contate o suporte.', 'erro');
            return; // Para a execução da função aqui.
        }

        // --- ETAPA 3: Se tudo foi encontrado, pegar os valores e montar o objeto ---
        const veiculoParaSalvar = {
            placa: placaInput.value.toUpperCase(),
            marca: marcaInput.value,
            modelo: modeloInput.value,
            ano: parseInt(anoInput.value),
            cor: corInput.value
        };

        // --- ETAPA 4: Enviar para o backend ---
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculoParaSalvar)
        });

        const resultado = await response.json();
        if (!response.ok) {
            throw new Error(resultado.error || 'Erro desconhecido do servidor.');
        }

        exibirNotificacao('Veículo adicionado com sucesso!', 'sucesso');
        toggleFormAddVeiculo(false);
        await buscarErenderizarVeiculos();

    } catch (error) {
        // O catch agora pega erros de fetch ou outros erros inesperados.
        console.error("Erro ao adicionar veículo:", error);
        exibirNotificacao(error.message || 'Ocorreu um erro ao adicionar o veículo.', 'erro');
    }
}

async function handleExcluirVeiculo(id) {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${id}`, { method: 'DELETE' });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error || 'Falha ao excluir o veículo.');
        exibirNotificacao(resultado.message, 'sucesso');
        document.getElementById(id)?.remove();
    } catch (error) {
        console.error('Erro ao excluir veículo:', error);
        exibirNotificacao(error.message, 'erro');
    }
}

async function handleEditarVeiculo(id) {
    const cardDoVeiculo = document.getElementById(id);
    if (!cardDoVeiculo) return;
    const corAtual = cardDoVeiculo.querySelector('.veiculo-cor').textContent;
    const novaCor = prompt('Digite a nova cor do veículo:', corAtual);
    if (!novaCor || novaCor === corAtual) return;
    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cor: novaCor })
        });
        const veiculoAtualizado = await response.json();
        if (!response.ok) throw new Error(veiculoAtualizado.error || 'Falha ao atualizar o veículo.');
        exibirNotificacao('Veículo atualizado com sucesso!', 'sucesso');
        cardDoVeiculo.querySelector('.veiculo-cor').textContent = veiculoAtualizado.cor;
    } catch (error) {
        console.error('Erro ao editar veículo:', error);
        exibirNotificacao(error.message, 'erro');
    }
}

async function handleVerificarClimaClick() {
    const cidade = destinoViagemInput.value.trim();
    if (!cidade) return exibirNotificacao("Por favor, digite uma cidade.", 'aviso');
    previsaoTempoResultado.innerHTML = `<p>Buscando previsão para ${cidade}...</p>`;
    try {
        const response = await fetch(`${backendUrl}/api/previsao/${cidade}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro do servidor: ${response.status}`);
        }
        const data = await response.json();
        exibirPrevisaoDetalhada(data);
    } catch (error) {
        console.error("Erro ao verificar clima:", error);
        previsaoTempoResultado.innerHTML = `<p style="color:red;">${error.message}</p>`;
        exibirNotificacao(error.message, 'erro');
    }
}

function exibirPrevisaoDetalhada(dados) {
    if (!dados || !dados.list) {
        previsaoTempoResultado.innerHTML = `<p>Não foi possível obter dados de previsão.</p>`;
        return;
    }
    const nomeCidade = dados.city.name;
    const previsaoHoje = dados.list[0];
    const icone = previsaoHoje.weather[0].icon;
    const descricao = previsaoHoje.weather[0].description;
    const temperatura = previsaoHoje.main.temp;
    previsaoTempoResultado.innerHTML = `
        <h3>Previsão para ${nomeCidade}</h3>
        <div class="previsao-dia">
            <img src="https://openweathermap.org/img/wn/${icone}@2x.png" alt="${descricao}">
            <p><strong>${temperatura.toFixed(1)}°C</strong></p>
            <p>${descricao}</p>
        </div>
    `;
}

// no arquivo: js/script.js

async function handleMostrarDetalhes(id) {
    if (!detalhesContainer || !informacoesVeiculoDiv) return;

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${id}`);
        const veiculo = await response.json();

        if (!response.ok) {
            throw new Error(veiculo.error || 'Não foi possível buscar os detalhes do veículo.');
        }

        // Lógica para formatar os novos dados
        const valorFIPEFormatado = veiculo.valorFIPE 
            ? `R$ ${veiculo.valorFIPE.toFixed(2).replace('.', ',')}` 
            : 'Não informado';
            
        const recallStatus = veiculo.recallPendente 
            ? '<span class="status-negativo">Sim!</span>' 
            : '<span class="status-positivo">Não</span>';

        informacoesVeiculoDiv.innerHTML = `
            <div class="detalhes-info-basica">
                <h3>${veiculo.marca} ${veiculo.modelo}</h3>
                <img src="img/carro.jpg" alt="Imagem ${veiculo.modelo}" class="detalhes-imagem" onerror="this.src='img/placeholder.png';">
                <p><strong>Placa:</strong> <span>${veiculo.placa}</span></p>
                <p><strong>Ano:</strong> <span>${veiculo.ano}</span></p>
                <p><strong>Cor:</strong> <span>${veiculo.cor}</span></p>

                <!-- Seção de Dados Adicionais -->
                <div class="detalhes-info-adicional">
                    <h4>Informações de Mercado</h4>
                    <p><strong>Valor FIPE (aprox.):</strong> <span>${valorFIPEFormatado}</span></p>
                    <p><strong>Recall Pendente:</strong> ${recallStatus}</p>
                    <p><strong>Seguradora Recomendada:</strong> <span>${veiculo.seguradoraRecomendada || 'N/A'}</span></p>
                </div>
            </div>
        `;

        document.getElementById('manutencao-veiculo-id').value = id;
        await carregarManutencoes(id);
        
        detalhesContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Erro ao mostrar detalhes:', error);
        exibirNotificacao(error.message, 'erro');
    }
}

// ===================================================================================
// Funções de Notificação (Utilitário)
// ===================================================================================

function exibirNotificacao(message, type = 'info', duration = 5000) {
    if (!notificacoesContainer || !message) return;
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notificacao ${type}`;
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notificationDiv.appendChild(messageSpan);
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'close-btn';
    closeButton.onclick = () => fecharNotificacao(notificationDiv);
    notificationDiv.appendChild(closeButton);
    notificacoesContainer.prepend(notificationDiv);
    requestAnimationFrame(() => notificationDiv.classList.add('show'));
    const timerId = setTimeout(() => fecharNotificacao(notificationDiv), duration);
    notificationDiv.dataset.timerId = timerId;
}

function fecharNotificacao(notificationDiv) {
    if (!notificationDiv || !notificationDiv.parentNode) return;
    clearTimeout(notificationDiv.dataset.timerId);
    notificationDiv.classList.remove('show');
    setTimeout(() => notificationDiv.remove(), 500);
}
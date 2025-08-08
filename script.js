/**
 * @file script.js
 * @description Lógica principal da Garagem Inteligente (versão com Banco de Dados).
 * @author Arthur
 */

console.log("ESPIÃO 1: Arquivo script.js foi carregado.");

// ===================================================================================
// Bloco de Configuração e Variáveis Globais
// ===================================================================================

const RENDER_BACKEND_URL = 'https://carroanimado.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:3001';

const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? LOCAL_BACKEND_URL
    : RENDER_BACKEND_URL;

console.log(`[CONFIG] Conectando ao backend em: ${backendUrl}`);

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

// ===================================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("ESPIÃO 2: DOMContentLoaded disparado. A página HTML terminou de carregar.");
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

// ===================================================================================
// Funções de Ação e Eventos
// ===================================================================================

// D:/carro/js/script.js

function setupEventListeners() {
    console.log("ESPIÃO 3: Entrei na função setupEventListeners.");

    // --- Listeners dos botões principais ---
    btnMostrarFormAdd?.addEventListener('click', () => toggleFormAddVeiculo(addVeiculoFormContainer.style.display === 'none'));
    btnCancelarAdd?.addEventListener('click', () => toggleFormAddVeiculo(false));
    formAddVeiculo?.addEventListener('submit', handleAddVeiculoSubmit);

    // Listener do botão de verificar clima
    verificarClimaBtn?.addEventListener('click', handleVerificarClimaClick);
    console.log("ESPIÃO 4: A variável 'verificarClimaBtn' é:", verificarClimaBtn);


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
    const veiculoParaSalvar = {
        placa: document.getElementById('add-placa').value.toUpperCase(),
        marca: document.getElementById('add-marca').value,
        modelo: document.getElementById('add-modelo').value,
        ano: document.getElementById('add-ano').value,
        cor: document.getElementById('add-cor').value
    };
    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculoParaSalvar)
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error || 'Erro desconhecido do servidor.');
        exibirNotificacao('Veículo adicionado com sucesso!', 'sucesso');
        toggleFormAddVeiculo(false);
        buscarErenderizarVeiculos();
    } catch (error) {
        console.error("Erro ao adicionar veículo:", error);
        exibirNotificacao(error.message, 'erro');
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

async function handleMostrarDetalhes(id) {
    if (!detalhesContainer || !informacoesVeiculoDiv) return;

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${id}`);
        const veiculo = await response.json();

        if (!response.ok) {
            throw new Error(veiculo.error || 'Não foi possível buscar os detalhes do veículo.');
        }

        // Monta o HTML com os detalhes do veículo
        informacoesVeiculoDiv.innerHTML = `
            <div class="detalhes-info-basica">
                <h3>${veiculo.marca} ${veiculo.modelo}</h3>
                <img src="img/carro.jpg" alt="Imagem ${veiculo.modelo}" class="detalhes-imagem" onerror="this.src='img/placeholder.png';">
                <p><strong>Placa:</strong> <span>${veiculo.placa}</span></p>
                <p><strong>Marca:</strong> <span>${veiculo.marca}</span></p>
                <p><strong>Modelo:</strong> <span>${veiculo.modelo}</span></p>
                <p><strong>Ano:</strong> <span>${veiculo.ano}</span></p>
                <p><strong>Cor:</strong> <span>${veiculo.cor}</span></p>
                <p><strong>Cadastrado em:</strong> <span>${new Date(veiculo.createdAt).toLocaleDateString('pt-BR')}</span></p>
            </div>
        `;

        // Mostra o modal
        detalhesContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Erro ao mostrar detalhes:', error);
        exibirNotificacao(error.message, 'erro');
    }
}

function fecharDetalhes() {
    if (!detalhesContainer) return;
    detalhesContainer.style.display = 'none';
    document.body.style.overflow = 'auto';
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
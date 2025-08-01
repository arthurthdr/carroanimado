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

// ===================================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================================================================

// Este é o ÚNICO bloco que inicia tudo quando a página carrega.
document.addEventListener('DOMContentLoaded', () => {
    console.log("[INICIO] Garagem Inteligente v2 (com DB) inicializando...");
    
    // 1. Configura todos os ouvintes de eventos (cliques em botões, etc.)
    setupEventListeners();
    
    // 2. Busca os veículos do banco de dados e desenha na tela.
    buscarErenderizarVeiculos();

    // 3. (Opcional) Carrega outros dados dinâmicos do backend.
    // Deixei comentado por enquanto para focarmos no CRUD de veículos.
    // carregarVeiculosDestaque();
    // carregarServicosGaragem();
    // carregarFerramentasEssenciais();
    // carregarDicasGerais();
    
    exibirNotificacao("Bem-vindo à Garagem Inteligente!", "sucesso", 3000);
});


// ===================================================================================
// Funções de Renderização e UI (Interface do Usuário)
// ===================================================================================

async function buscarErenderizarVeiculos() {
    if (!garagemContainer) return;
    
    try {
        console.log('[Frontend] Buscando veículos do backend...');
        const response = await fetch(`${backendUrl}/api/veiculos`);
        if (!response.ok) {
            throw new Error('Falha ao buscar veículos do servidor.');
        }
        const veiculosDoBanco = await response.json();
        console.log('[Frontend] Veículos recebidos:', veiculosDoBanco);

        if (veiculosDoBanco.length === 0) {
            garagemContainer.innerHTML = '<p id="garagem-vazia-msg" style="display: block;">Sua garagem está vazia. Adicione um veículo!</p>';
        } else {
            garagemContainer.innerHTML = veiculosDoBanco.map(gerarHTMLVeiculoDoBanco).join('');
        }
    } catch (error) {
        console.error('Erro ao buscar veículos:', error);
        garagemContainer.innerHTML = `<p style="color:red;">Erro ao carregar a garagem. Tente recarregar a página.</p>`;
        exibirNotificacao(error.message, 'erro');
    }
}

function gerarHTMLVeiculoDoBanco(veiculo) {
    // veiculo aqui é o objeto que vem direto do MongoDB, com _id, placa, marca, etc.
    return `
        <div id="${veiculo._id}" class="veiculo-container">
            <button class="remover-veiculo-btn" data-action="remover" data-id="${veiculo._id}" title="Remover ${veiculo.modelo}">×</button>
            <h2>${veiculo.marca} ${veiculo.modelo}</h2>
            <img src="img/carro.jpg" alt="Imagem ${veiculo.modelo}" class="veiculo-imagem" onerror="this.src='img/placeholder.png';">
            <p><strong>Placa:</strong> ${veiculo.placa}</p>
            <p><strong>Ano:</strong> ${veiculo.ano}</p>
            <p><strong>Cor:</strong> ${veiculo.cor}</p>
            
            <div class="controles-veiculo">
                 <p style="font-size: 0.8em; color: #888;">(Controles de simulação a implementar)</p>
                 <button data-action="detalhes" data-id="${veiculo._id}">Detalhes</button>
            </div>
        </div>
    `;
}

function toggleFormAddVeiculo(show) {
    if (!addVeiculoFormContainer || !btnMostrarFormAdd) return;

    if (show) {
        addVeiculoFormContainer.style.display = 'block';
        btnMostrarFormAdd.textContent = 'Cancelar Adição';
        formAddVeiculo.reset();
    } else {
        addVeiculoFormContainer.style.display = 'none';
        btnMostrarFormAdd.textContent = 'Adicionar Novo Veículo +';
    }
}

// ===================================================================================
// Funções de Ação e Eventos
// ===================================================================================

function setupEventListeners() {
    // Listener para o botão "Adicionar Novo Veículo +"
    btnMostrarFormAdd?.addEventListener('click', () => {
        const isHidden = addVeiculoFormContainer.style.display === 'none' || addVeiculoFormContainer.style.display === '';
        toggleFormAddVeiculo(isHidden);
    });

    // Listener para o botão "Cancelar" do formulário
    btnCancelarAdd?.addEventListener('click', () => toggleFormAddVeiculo(false));
    
    // Listener para o envio do formulário
    formAddVeiculo?.addEventListener('submit', handleAddVeiculoSubmit);
}

async function handleAddVeiculoSubmit(event) {
    event.preventDefault(); // Impede o recarregamento da página

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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(veiculoParaSalvar)
        });

        const resultado = await response.json();

        if (!response.ok) {
            // A mensagem de erro virá do nosso backend (ex: 'Placa já existe')
            throw new Error(resultado.error || 'Erro desconhecido do servidor.');
        }

        exibirNotificacao('Veículo adicionado com sucesso!', 'sucesso');
        toggleFormAddVeiculo(false); // Fecha e reseta o formulário
        
        // A MÁGICA: Após adicionar, busca a lista atualizada do banco e redesenha a garagem!
        buscarErenderizarVeiculos();

    } catch (error) {
        console.error("Erro ao adicionar veículo:", error);
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

    requestAnimationFrame(() => {
        notificationDiv.classList.add('show');
    });

    const timerId = setTimeout(() => fecharNotificacao(notificationDiv), duration);
    notificationDiv.dataset.timerId = timerId;
}

function fecharNotificacao(notificationDiv) {
    if (!notificationDiv || !notificationDiv.parentNode) return;
    clearTimeout(notificationDiv.dataset.timerId);
    notificationDiv.classList.remove('show');
    setTimeout(() => notificationDiv.remove(), 500);
}
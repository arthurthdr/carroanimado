/**
 * @file script.js
 * @description Lógica principal da Garagem Inteligente.
 * @author Arthur
 */

// ===================================================================================
// Bloco de Configuração e Variáveis Globais
// ===================================================================================

// URLs do Backend
const RENDER_BACKEND_URL = 'https://carroanimado.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:3001';

// Determina dinamicamente qual URL usar.
const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? LOCAL_BACKEND_URL
    : RENDER_BACKEND_URL;

console.log(`[CONFIG] Conectando ao backend em: ${backendUrl}`);

// Variáveis Globais da Aplicação
const veiculos = {};
const GARAGE_STORAGE_KEY = 'garagemInteligenteDadosV3';
let veiculoSelecionadoId = null; // Para saber qual veículo está no modal de detalhes

// Elementos DOM (cacheados para melhor performance)
const notificacoesContainer = document.getElementById('notificacoes');
const garagemContainer = document.getElementById('garagem-container');
const garagemVaziaMsg = document.getElementById('garagem-vazia-msg');
const btnMostrarFormAdd = document.getElementById('mostrar-form-add');
const addVeiculoFormContainer = document.getElementById('add-veiculo-form-container');
const formAddVeiculo = document.getElementById('form-add-veiculo');
const addTipoSelect = document.getElementById('add-tipo');
const addModeloInput = document.getElementById('add-modelo');
const addCorInput = document.getElementById('add-cor');
const campoCapacidadeCarga = document.getElementById('campo-capacidade-carga');
const addCapacidadeCargaInput = document.getElementById('add-capacidade-carga');
const btnCancelarAdd = document.getElementById('cancelar-add-veiculo');
const detalhesContainer = document.getElementById('detalhes-e-agendamento');
const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
const agendamentoFormContainer = document.getElementById('agendamento-form-container');
const agendamentosFuturosContainer = document.getElementById('agendamentos-futuros-container');
const agendamentosFuturosConteudo = document.getElementById('agendamentos-futuros-conteudo');
const formAgendamento = document.getElementById('form-agendamento');
const btnFecharDetalhes = document.getElementById('fechar-detalhes');
const destinoViagemInput = document.getElementById('destino-viagem');
const verificarClimaBtn = document.getElementById('verificar-clima-btn');
const previsaoTempoResultado = document.getElementById('previsao-tempo-resultado');

// Sons
const sons = {
    buzina: document.getElementById("som-buzina"),
    acelerar: document.getElementById("som-acelerar"),
    frear: document.getElementById("som-freio"),
    ligar: document.getElementById("som-ligar"),
    desligar: document.getElementById("som-desligar"),
    adicionar: document.getElementById("som-adicionar")
};

// ===================================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("[INICIO] Garagem Inteligente inicializando...");
    
    // Configura os ouvintes de eventos primeiro
    setupEventListeners();
    
    // Carrega dados salvos e renderiza a garagem
    carregarGaragemDoLocalStorage();
    renderizarGaragem();

    // Carrega dados dinâmicos do backend
    carregarVeiculosDestaque();
    carregarServicosGaragem();
    carregarFerramentasEssenciais();
    carregarDicasGerais();
    
    // Outras verificações
    verificarAgendamentosProximos();

    console.log("[INICIO] Garagem pronta!");
    exibirNotificacao("Garagem pronta e conectada!", "sucesso", 3000);
});


// ===================================================================================
// Funções de Notificação
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
    closeButton.setAttribute('aria-label', 'Fechar');
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


// ===================================================================================
// Funções de Persistência de Dados (LocalStorage)
// ===================================================================================

function salvarGaragemNoLocalStorage() {
    try {
        const dataToSave = {};
        Object.entries(veiculos).forEach(([id, veiculo]) => {
            if (veiculo && typeof veiculo.toJSON === 'function') {
                dataToSave[id] = veiculo.toJSON();
            }
        });
        localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Erro ao salvar no LocalStorage:", error);
        exibirNotificacao("Falha ao salvar os dados da garagem.", 'erro');
    }
}

function carregarGaragemDoLocalStorage() {
    try {
        const storedData = localStorage.getItem(GARAGE_STORAGE_KEY);
        if (!storedData) return;

        const parsedData = JSON.parse(storedData);
        Object.values(parsedData).forEach(data => {
            const veiculo = reconstruirVeiculo(data);
            if (veiculo) {
                veiculos[veiculo.id] = veiculo;
            }
        });
    } catch (error) {
        console.error("Erro ao carregar dados do LocalStorage:", error);
        exibirNotificacao("Dados salvos parecem corrompidos. Resetando.", 'erro');
        resetarLocalStorage();
    }
}

function resetarLocalStorage() {
    try {
        localStorage.removeItem(GARAGE_STORAGE_KEY);
        Object.keys(veiculos).forEach(key => delete veiculos[key]);
        renderizarGaragem();
    } catch (error) {
        console.error("Erro ao resetar LocalStorage:", error);
    }
}

function reconstruirVeiculo(data) {
    if (!data || !data.tipoVeiculo || !data.id) return null;
    
    let veiculo;
    try {
        switch (data.tipoVeiculo) {
            case 'Carro': veiculo = new Carro(data.modelo, data.cor, data.id); break;
            case 'CarroEsportivo': veiculo = new CarroEsportivo(data.modelo, data.cor, data.id); break;
            case 'Caminhao': veiculo = new Caminhao(data.modelo, data.cor, data.id, data.capacidadeCarga); break;
            case 'Moto': veiculo = new Moto(data.modelo, data.cor, data.id); break;
            case 'Bicicleta': veiculo = new Bicicleta(data.modelo, data.cor, data.id); break;
            default: return null;
        }

        // Restaurar estado do objeto
        Object.assign(veiculo, data);

        // Recriar o histórico de manutenção com objetos da classe Manutencao
        if (Array.isArray(data.historicoManutencao)) {
            veiculo.historicoManutencao = data.historicoManutencao.map(m => new Manutencao(m.data, m.tipo, m.custo, m.descricao));
        }

        return veiculo;
    } catch (e) {
        console.error(`Erro ao reconstruir veículo tipo ${data.tipoVeiculo}:`, e);
        return null;
    }
}


// ===================================================================================
// Funções de Renderização e UI (Interface do Usuário)
// ===================================================================================

function renderizarGaragem() {
    if (!garagemContainer) return;
    
    const veiculosArray = Object.values(veiculos);
    
    if (veiculosArray.length === 0) {
        garagemContainer.innerHTML = '';
        garagemVaziaMsg.style.display = 'block';
    } else {
        garagemVaziaMsg.style.display = 'none';
        garagemContainer.innerHTML = veiculosArray.map(gerarHTMLVeiculo).join('');
    }
}

function gerarHTMLVeiculo(veiculo) {
    if (!veiculo || !veiculo.id) return '';

    const { id, tipoVeiculo, modelo, cor, ligado, velocidade } = veiculo;
    const isBicicleta = tipoVeiculo === 'Bicicleta';
    const isCaminhao = tipoVeiculo === 'Caminhao';
    const isCarroEsportivo = tipoVeiculo === 'CarroEsportivo';
    const isCarro = tipoVeiculo === 'Carro' || isCarroEsportivo;

    const imageName = tipoVeiculo.toLowerCase().replace(' ', '');
    const imageSource = `img/${imageName}.jpg`;

    const progresso = (velocidade / veiculo.getVelocidadeMaxima()) * 100;

    return `
        <div id="${id}" class="veiculo-container" data-tipo="${tipoVeiculo}">
            <button class="remover-veiculo-btn" data-action="remover" data-id="${id}" title="Remover ${modelo}">×</button>
            <h2>${tipoVeiculo.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <img src="${imageSource}" alt="Imagem ${modelo}" class="veiculo-imagem" onerror="this.src='img/placeholder.png';">
            <p><strong>Modelo:</strong> ${modelo}</p>
            <p><strong>Cor:</strong> ${cor}</p>
            ${!isBicicleta ? `<p><strong>Estado:</strong> <span class="veiculo-estado">${ligado ? 'Ligado' : 'Desligado'}</span></p>` : ''}
            <p><strong>Velocidade:</strong> <span class="veiculo-velocidade">${velocidade.toFixed(isCaminhao ? 1 : 0)}</span> km/h</p>
            ${isCarroEsportivo ? `<p><strong>Turbo:</strong> <span class="veiculo-turbo">${veiculo.turboAtivado ? 'Ativado' : 'Desativado'}</span></p>` : ''}
            ${isCaminhao ? `<p><strong>Carga:</strong> <span class="veiculo-carga">${veiculo.cargaAtual.toFixed(0)}</span> / ${veiculo.capacidadeCarga.toFixed(0)} kg</p>` : ''}
            
            <div class="barra-progresso-container">
                <div class="barra-progresso" style="width: ${progresso}%;"></div>
            </div>

            <div class="controles-veiculo">
                ${!isBicicleta ? `<button data-action="ligar" data-id="${id}">Ligar</button>` : ''}
                ${!isBicicleta ? `<button data-action="desligar" data-id="${id}">Desligar</button>` : ''}
                <button data-action="acelerar" data-id="${id}">Acelerar</button>
                <button data-action="frear" data-id="${id}">Frear</button>
                
                ${isCaminhao ? `
                    <input type="number" data-input="carga" data-id="${id}" placeholder="Qtd (kg)" min="0">
                    <button data-action="carregar" data-id="${id}">Carregar</button>
                    <button data-action="descarregar" data-id="${id}">Descarregar</button>
                ` : ''}
                
                ${isCarroEsportivo ? `
                    <button data-action="ativarTurbo" data-id="${id}">Ativar Turbo</button>
                    <button data-action="desativarTurbo" data-id="${id}">Desativar Turbo</button>
                ` : ''}
                
                <button data-action="mudarCor" data-id="${id}">Mudar Cor</button>
                
                ${isCarro ? `<button class="buzina-btn" data-action="buzinar" data-id="${id}">Buzinar</button>` : ''}
                
                <button data-action="detalhes" data-id="${id}">Detalhes</button>
            </div>
        </div>
    `;
}

function atualizarCardVeiculo(id) {
    const veiculo = veiculos[id];
    if (!veiculo) return;

    const cardElement = document.getElementById(id);
    if (!cardElement) return;

    // Em vez de recriar o HTML todo, atualizamos apenas as partes que mudam
    const estadoEl = cardElement.querySelector('.veiculo-estado');
    if (estadoEl) estadoEl.textContent = veiculo.ligado ? 'Ligado' : 'Desligado';

    const velEl = cardElement.querySelector('.veiculo-velocidade');
    if (velEl) velEl.textContent = veiculo.velocidade.toFixed(veiculo.tipoVeiculo === 'Caminhao' ? 1 : 0);

    const progressoEl = cardElement.querySelector('.barra-progresso');
    if (progressoEl) {
        const perc = (veiculo.velocidade / veiculo.getVelocidadeMaxima()) * 100;
        progressoEl.style.width = `${perc}%`;
        progressoEl.style.backgroundColor = perc > 85 ? '#dc3545' : perc > 60 ? '#ffc107' : '#0d6efd';
    }
    
    if (veiculo.tipoVeiculo === 'CarroEsportivo') {
        const turboEl = cardElement.querySelector('.veiculo-turbo');
        if (turboEl) turboEl.textContent = veiculo.turboAtivado ? 'Ativado' : 'Desativado';
    }

    if (veiculo.tipoVeiculo === 'Caminhao') {
        const cargaEl = cardElement.querySelector('.veiculo-carga');
        if (cargaEl) cargaEl.textContent = `${veiculo.cargaAtual.toFixed(0)} / ${veiculo.capacidadeCarga.toFixed(0)}`;
    }
}

function toggleFormAddVeiculo(show) {
    if (!addVeiculoFormContainer || !btnMostrarFormAdd) return;

    if (show) {
        addVeiculoFormContainer.style.display = 'block';
        btnMostrarFormAdd.textContent = 'Cancelar Adição';
        formAddVeiculo.reset();
        atualizarCamposOpcionaisFormAdd();
    } else {
        addVeiculoFormContainer.style.display = 'none';
        btnMostrarFormAdd.textContent = 'Adicionar Novo Veículo +';
    }
}

function atualizarCamposOpcionaisFormAdd() {
    if (!addTipoSelect || !campoCapacidadeCarga) return;
    const tipo = addTipoSelect.value;
    const isCaminhao = tipo === 'Caminhao';
    
    campoCapacidadeCarga.style.display = isCaminhao ? 'grid' : 'none';
    addCapacidadeCargaInput.required = isCaminhao;
}

function fecharDetalhes() {
    if (!detalhesContainer) return;
    detalhesContainer.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaura o scroll do body
}

function exibirInformacoesNaTela(id) {
    const veiculo = veiculos[id];
    if (!veiculo || !detalhesContainer || !informacoesVeiculoDiv) return;

    veiculoSelecionadoId = id;

    const imageName = veiculo.tipoVeiculo.toLowerCase().replace(' ', '');
    const imageSource = `img/${imageName}.jpg`;

    let detalhesEspecificos = '';
    if (veiculo.tipoVeiculo === 'CarroEsportivo') {
        detalhesEspecificos = `<p><strong>Turbo:</strong> ${veiculo.turboAtivado ? 'Ativado' : 'Desativado'}</p>`;
    }
    if (veiculo.tipoVeiculo === 'Caminhao') {
        detalhesEspecificos = `<p><strong>Capacidade de Carga:</strong> ${veiculo.capacidadeCarga.toFixed(0)} kg</p>
                              <p><strong>Carga Atual:</strong> ${veiculo.cargaAtual.toFixed(0)} kg</p>`;
    }
    
    const historico = veiculo.getHistoricoManutencaoFormatado();

    informacoesVeiculoDiv.innerHTML = `
        <div class="detalhes-info-basica">
            <h3>${veiculo.tipoVeiculo} ${veiculo.modelo}</h3>
            <img src="${imageSource}" alt="Imagem ${veiculo.modelo}" class="detalhes-imagem" onerror="this.src='img/placeholder.png';">
            <p><strong>Modelo:</strong> <span>${veiculo.modelo}</span></p>
            <p><strong>Cor:</strong> <span>${veiculo.cor}</span></p>
            ${veiculo.tipoVeiculo !== 'Bicicleta' ? `<p><strong>Estado:</strong> <span>${veiculo.ligado ? 'Ligado' : 'Desligado'}</span></p>` : ''}
            <p><strong>Velocidade:</strong> <span>${veiculo.velocidade.toFixed(0)} km/h</span></p>
            ${detalhesEspecificos}
        </div>
        <div class="detalhes-historico">
            <h4>Histórico de Manutenção</h4>
            <pre>${historico}</pre>
        </div>
    `;

    agendamentoFormContainer.style.display = veiculo.tipoVeiculo !== 'Bicicleta' ? 'block' : 'none';
    detalhesContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Impede o scroll do body
}

// ===================================================================================
// Funções de Ação e Eventos
// ===================================================================================

function setupEventListeners() {
    btnMostrarFormAdd?.addEventListener('click', () => {
        const isHidden = addVeiculoFormContainer.style.display === 'none' || addVeiculoFormContainer.style.display === '';
        toggleFormAddVeiculo(isHidden);
    });

    btnCancelarAdd?.addEventListener('click', () => toggleFormAddVeiculo(false));
    addTipoSelect?.addEventListener('change', atualizarCamposOpcionaisFormAdd);
    formAddVeiculo?.addEventListener('submit', handleAddVeiculoSubmit);

    garagemContainer?.addEventListener('click', handleVehicleAction);

    verificarClimaBtn?.addEventListener('click', handleVerificarClimaClick);
    btnFecharDetalhes?.addEventListener('click', fecharDetalhes);
    formAgendamento?.addEventListener('submit', handleAgendamentoSubmit);

    document.querySelectorAll('.dica-tipo-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const tipo = event.target.dataset.tipo;
            if (tipo) buscarDicasPorTipo(tipo);
        });
    });
}

function handleAddVeiculoSubmit(event) {
    event.preventDefault();
    try {
        const tipo = addTipoSelect.value;
        const modelo = addModeloInput.value.trim();
        const cor = addCorInput.value.trim();

        if (!tipo || !modelo || !cor) {
            return exibirNotificacao("Preencha Tipo, Modelo e Cor.", 'erro');
        }

        const id = `${tipo.toLowerCase()}_${Date.now()}`;
        let novoVeiculo;

        switch (tipo) {
            case 'Carro': novoVeiculo = new Carro(modelo, cor, id); break;
            case 'CarroEsportivo': novoVeiculo = new CarroEsportivo(modelo, cor, id); break;
            case 'Caminhao':
                const capacidade = parseFloat(addCapacidadeCargaInput.value);
                if (isNaN(capacidade) || capacidade <= 0) {
                    return exibirNotificacao("Capacidade de carga inválida.", 'erro');
                }
                novoVeiculo = new Caminhao(modelo, cor, id, capacidade);
                break;
            case 'Moto': novoVeiculo = new Moto(modelo, cor, id); break;
            case 'Bicicleta': novoVeiculo = new Bicicleta(modelo, cor, id); break;
            default: return exibirNotificacao("Tipo de veículo inválido.", 'erro');
        }

        veiculos[id] = novoVeiculo;
        salvarGaragemNoLocalStorage();
        renderizarGaragem();
        toggleFormAddVeiculo(false);
        exibirNotificacao(`${novoVeiculo.tipoVeiculo.replace(/([A-Z])/g, ' $1').trim()} adicionado!`, 'sucesso');
        tocarSom(sons.adicionar);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (e) {
        console.error("Erro ao adicionar veículo:", e);
        exibirNotificacao("Ocorreu um erro inesperado.", 'erro');
    }
}

function handleVehicleAction(event) {
    const target = event.target.closest('button[data-action], input[data-input]');
    if (!target) return;

    const { action, id } = target.dataset;
    const veiculo = veiculos[id];
    if (!veiculo) return;

    switch (action) {
        case 'ligar': veiculo.ligar(); break;
        case 'desligar': veiculo.desligar(); break;
        case 'acelerar': veiculo.acelerar(10); break;
        case 'frear': veiculo.frear(10); break;
        case 'mudarCor':
            const novaCor = prompt(`Nova cor para ${veiculo.modelo}:`, veiculo.cor);
            if (novaCor) veiculo.mudarCor(novaCor);
            renderizarGaragem(); // Re-renderiza para atualizar a cor
            break;
        case 'remover':
            if (confirm(`Tem certeza que deseja remover o ${veiculo.modelo}?`)) {
                delete veiculos[id];
                salvarGaragemNoLocalStorage();
                renderizarGaragem();
                exibirNotificacao("Veículo removido.", 'info');
            }
            break;
        case 'detalhes': exibirInformacoesNaTela(id); break;
        case 'buzinar': tocarSom(sons.buzina); break;
        case 'ativarTurbo': if (veiculo.ativarTurbo) veiculo.ativarTurbo(); break;
        case 'desativarTurbo': if (veiculo.desativarTurbo) veiculo.desativarTurbo(); break;
        case 'carregar':
        case 'descarregar':
            if (veiculo.carregar) { // Verifica se é um caminhão
                const inputCarga = document.querySelector(`input[data-input="carga"][data-id="${id}"]`);
                if (inputCarga && inputCarga.value) {
                    const quantidade = parseFloat(inputCarga.value);
                    if (action === 'carregar') veiculo.carregar(quantidade);
                    if (action === 'descarregar') veiculo.descarregar(quantidade);
                    inputCarga.value = '';
                }
            }
            break;
        default: return; // Não faz nada se a ação for desconhecida
    }

    // Após qualquer ação, atualiza o card e salva o estado
    if(action !== 'remover' && action !== 'mudarCor') { // Remover e mudar cor já re-renderizam
         atualizarCardVeiculo(id);
    }
    salvarGaragemNoLocalStorage();
}

function handleAgendamentoSubmit(event) {
    event.preventDefault();
    const veiculo = veiculos[veiculoSelecionadoId];
    if (!veiculo) return;

    const data = document.getElementById('agenda-data').value;
    const tipo = document.getElementById('agenda-tipo').value;
    const custo = parseFloat(document.getElementById('agenda-custo').value);
    const descricao = document.getElementById('agenda-descricao').value;

    if (!data || !tipo || isNaN(custo)) {
        return exibirNotificacao("Preencha Data, Tipo e Custo.", 'erro');
    }

    const manutencao = new Manutencao(data, tipo, custo, descricao);
    if (veiculo.adicionarManutencao(manutencao)) {
        salvarGaragemNoLocalStorage();
        exibirNotificacao("Manutenção registrada!", 'sucesso');
        exibirInformacoesNaTela(veiculoSelecionadoId); // Re-exibe para atualizar o histórico
        formAgendamento.reset();
    } else {
        exibirNotificacao("Erro ao registrar manutenção.", 'erro');
    }
}

async function handleVerificarClimaClick() {
    const cidade = destinoViagemInput.value.trim();
    if (!cidade) {
        return exibirNotificacao("Por favor, digite uma cidade.", 'aviso');
    }

    previsaoTempoResultado.innerHTML = `<p>Buscando previsão para ${cidade}...</p>`;

    try {
        const response = await fetch(`${backendUrl}/api/previsao/${cidade}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Não foi possível obter a previsão.');
        }

        const previsaoProcessada = processarDadosForecast(data);
        exibirPrevisaoDetalhada(previsaoProcessada, data.city.name);

    } catch (error) {
        console.error("Erro ao verificar clima:", error);
        previsaoTempoResultado.innerHTML = `<p style="color:red;">${error.message}</p>`;
        exibirNotificacao(error.message, 'erro');
    }
}

// ===================================================================================
// Funções de Carregamento de Dados do Backend
// ===================================================================================

// Função Genérica para Fetch
async function fetchData(endpoint, containerId, renderFunction) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p>Carregando...</p>';
    try {
        const response = await fetch(`${backendUrl}${endpoint}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro do servidor: ${response.status}`);
        }
        const data = await response.json();
        renderFunction(data, container);
    } catch (error) {
        console.error(`Erro ao carregar dados de ${endpoint}:`, error);
        container.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// Funções Específicas de Carregamento e Renderização
function carregarVeiculosDestaque() {
    fetchData('/api/garagem/veiculos-destaque', 'cards-veiculos-destaque', (data, container) => {
        if (data.length === 0) {
            container.innerHTML = '<p>Nenhum veículo em destaque.</p>';
            return;
        }
        container.innerHTML = data.map(v => `
            <div class="veiculo-destaque-card">
                <img src="${v.imagemUrl || 'img/placeholder.png'}" alt="${v.modelo}" onerror="this.src='img/placeholder.png';">
                <h3>${v.modelo} (${v.ano})</h3>
                <p><strong>Destaque:</strong> ${v.destaque}</p>
            </div>
        `).join('');
    });
}

function carregarServicosGaragem() {
    fetchData('/api/garagem/servicos-oferecidos', 'lista-servicos-oferecidos', (data, container) => {
        container.tagName === 'UL' ? container.innerHTML = '' : container.innerHTML = '<ul></ul>';
        const list = container.tagName === 'UL' ? container : container.querySelector('ul');
        if (data.length === 0) {
            list.innerHTML = '<li>Nenhum serviço disponível.</li>';
            return;
        }
        list.innerHTML = data.map(s => `
            <li><strong>${s.nome}</strong>: ${s.descricao} <em>(Estimado: ${s.precoEstimado})</em></li>
        `).join('');
    });
}

function carregarFerramentasEssenciais() {
    fetchData('/api/garagem/ferramentas-essenciais', 'lista-ferramentas-essenciais', (data, container) => {
        if (data.length === 0) {
            container.innerHTML = '<p>Nenhuma ferramenta listada.</p>';
            return;
        }
        container.innerHTML = data.map(f => `
            <div class="ferramenta-item">
                <strong>${f.nome}</strong>: ${f.utilidade}
                ${f.linkCompra ? ` <a href="${f.linkCompra}" target="_blank">[Ver]</a>` : ''}
            </div>
        `).join('');
    });
}

function carregarDicasGerais() {
    fetchData('/api/dicas-manutencao', 'lista-dicas-gerais', (data, container) => {
        container.tagName === 'UL' ? container.innerHTML = '' : container.innerHTML = '<ul></ul>';
        const list = container.tagName === 'UL' ? container : container.querySelector('ul');
        if (data.length === 0) {
            list.innerHTML = '<li>Nenhuma dica geral disponível.</li>';
            return;
        }
        list.innerHTML = data.map(d => `<li>${d.dica}</li>`).join('');
    });
}

async function buscarDicasPorTipo(tipo) {
    const lista = document.getElementById('lista-dicas-especificas');
    if (!lista) return;

    lista.innerHTML = `<li>Buscando dicas para ${tipo}...</li>`;
    try {
        const response = await fetch(`${backendUrl}/api/dicas-manutencao/${tipo}`);
        const dicas = await response.json();

        if (!response.ok) {
            throw new Error(dicas.error || `Falha ao buscar dicas para ${tipo}.`);
        }

        if (dicas.length === 0) {
            lista.innerHTML = `<li>Nenhuma dica específica para ${tipo}.</li>`;
            return;
        }
        lista.innerHTML = dicas.map(dica => `<li>${dica.dica}</li>`).join('');

    } catch (error) {
        console.error(`Erro ao buscar dicas para ${tipo}:`, error);
        lista.innerHTML = `<li style="color:red;">${error.message}</li>`;
    }
}

// ===================================================================================
// Funções Utilitárias
// ===================================================================================

function tocarSom(element) {
    if (element?.play) {
        element.currentTime = 0;
        element.play().catch(error => console.warn("Interação do usuário necessária para tocar som.", error.name));
    }
}

function verificarAgendamentosProximos() {
    // Lógica futura para verificar agendamentos e notificar o usuário
}

function processarDadosForecast(dados) {
    if (!dados || !dados.list) return [];

    const previsaoPorDia = {};
    dados.list.forEach(item => {
        const data = new Date(item.dt * 1000);
        const dia = data.toISOString().split('T')[0];
        
        if (!previsaoPorDia[dia]) {
            previsaoPorDia[dia] = {
                data: data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }),
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                icones: new Set(),
                descricoes: new Set()
            };
        }
        // Atualiza min/max para o dia todo
        previsaoPorDia[dia].temp_min = Math.min(previsaoPorDia[dia].temp_min, item.main.temp_min);
        previsaoPorDia[dia].temp_max = Math.max(previsaoPorDia[dia].temp_max, item.main.temp_max);
        previsaoPorDia[dia].icones.add(item.weather[0].icon.slice(0, 2)); // Pega o ícone base (ex: '04' de '04d')
        previsaoPorDia[dia].descricoes.add(item.weather[0].description);
    });

    return Object.values(previsaoPorDia).slice(0, 5).map(dia => ({
        ...dia,
        icone: `https://openweathermap.org/img/wn/${Array.from(dia.icones)[0]}d@2x.png`, // Pega o primeiro ícone do dia
        descricao: Array.from(dia.descricoes).join(', ')
    }));
}


function exibirPrevisaoDetalhada(previsao, nomeCidade) {
    if (!previsaoTempoResultado) return;

    if (previsao.length === 0) {
        previsaoTempoResultado.innerHTML = `<p>Não foi possível obter a previsão para ${nomeCidade}.</p>`;
        return;
    }

    const cardsHTML = previsao.map(dia => `
        <div class="previsao-dia">
            <h4>${dia.data}</h4>
            <img src="${dia.icone}" alt="${dia.descricao}">
            <p>${dia.descricao}</p>
            <p><strong>Min:</strong> ${dia.temp_min.toFixed(0)}°C / <strong>Max:</strong> ${dia.temp_max.toFixed(0)}°C</p>
        </div>
    `).join('');

    previsaoTempoResultado.innerHTML = `
        <h3>Previsão para os próximos dias em ${nomeCidade}</h3>
        <div class="previsao-tempo-container">
            ${cardsHTML}
        </div>
    `;
}
/**
 * 
 * @file script.js
 * @description Lógica principal da Garagem Inteligente.
 */
// No topo do seu js/script.js
const backendUrl = 'http://localhost:3001'; // OU 'https://seu-backend-no-render.onrender.com'
// ... resto do seu código ...
// --- Variáveis Globais e Elementos DOM ---
const veiculos = {};
const GARAGE_STORAGE_KEY = 'garagemInteligenteDadosV3';

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

/**
 * Salva os dados da garagem no LocalStorage.
 */
function salvarGaragemNoLocalStorage() {
    try {
        console.log("[DEBUG] salvarGaragemNoLocalStorage() chamada.");
        const dataToSave = {};
        Object.entries(veiculos).forEach(([id, veiculo]) => {
            if (veiculo && veiculo.toJSON) {
                dataToSave[id] = veiculo.toJSON();
            } else {
                console.warn(`Veículo com ID ${id} não pôde ser serializado.`);
            }
        });
        localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(dataToSave));
        console.log("Garagem salva no LocalStorage.");
    } catch (error) {
        console.error("Erro ao salvar no LocalStorage:", error);
        if (error.name === 'QuotaExceededError') {
            exibirNotificacao("Erro: Limite de armazenamento excedido!", 'erro', 10000);
        } else {
            exibirNotificacao("Falha ao salvar os dados.", 'erro');
        }
    }
}

/**
 * Carrega os dados da garagem do LocalStorage.
 */
function carregarGaragemDoLocalStorage() {
    try {
        console.log("[DEBUG] carregarGaragemDoLocalStorage() chamada.");
        const storedData = localStorage.getItem(GARAGE_STORAGE_KEY);
        if (!storedData) {
            console.log("Nenhum dado encontrado no LocalStorage.");
            return false;
        }

        const parsedData = JSON.parse(storedData);
        let successCount = 0, failCount = 0;

        Object.entries(parsedData).forEach(([id, data]) => {
            try {
                const veiculo = reconstruirVeiculo(data);
                if (veiculo) {
                    veiculos[id] = veiculo;
                    successCount++;
                } else {
                    failCount++;
                    console.warn(`Falha ao reconstruir veículo com ID ${id}.`);
                }
            } catch (reconstructError) {
                failCount++;
                console.error(`Erro ao reconstruir veículo com ID ${id}:`, reconstructError);
            }
        });

        console.log(`Carregamento do LocalStorage: ${successCount} sucesso(s), ${failCount} falha(s).`);
        if (failCount > 0) {
            exibirNotificacao(`${failCount} registro(s) corrompido(s) ignorado(s).`, 'aviso', 8000);
        }

        return successCount > 0 || failCount === 0;
    } catch (parseError) {
        console.error("Erro ao analisar dados do LocalStorage:", parseError);
        exibirNotificacao("Erro grave ao ler os dados. Resetando a garagem.", 'erro', 10000);
        resetarLocalStorage();
        return false;
    }
}

/**
 * Reseta o LocalStorage, removendo a chave da garagem.
 */
function resetarLocalStorage() {
    try {
        console.log("[DEBUG] resetarLocalStorage() chamada.");
        localStorage.removeItem(GARAGE_STORAGE_KEY);
        console.log("Chave do LocalStorage removida.");
    } catch (removeError) {
        console.error("Erro ao remover chave do LocalStorage:", removeError);
    }
    Object.keys(veiculos).forEach(key => delete veiculos[key]);
    renderizarGaragem();
}

/**
 * Gera o HTML para exibir um veículo na garagem.
 */
function gerarHTMLVeiculo(veiculo) {
    try{
        console.log("[DEBUG] gerarHTMLVeiculo() chamada.");
        if (!veiculo || !veiculo.id) {
            console.error("Erro ao gerar HTML: Veículo inválido:", veiculo);
            return '';
        }

        const { id, tipoVeiculo, modelo, cor, velocidade, ligado } = veiculo;
        const isBicicleta = veiculo instanceof Bicicleta;
        const isCaminhao = veiculo instanceof Caminhao;
        const isCarro = veiculo instanceof Carro;
        const isCarroEsportivo = veiculo instanceof CarroEsportivo;

        let imageName = tipoVeiculo.toLowerCase();
        let imageExtension = '.jpg';

        if (tipoVeiculo === 'Moto') imageExtension = '.webp';
        if (tipoVeiculo === 'CarroEsportivo') imageName = 'carroesportivo';

        const imageSource = `img/${imageName}${imageExtension}`;

        return `
            <div id="${id}" class="veiculo-container" data-tipo="${tipoVeiculo}">
                <button class="remover-veiculo-btn" data-action="remover" data-id="${id}" title="Remover ${modelo}">×</button>
                <h2>${tipoVeiculo.replace(/([A-Z])/g, ' $1').trim()}</h2>
                <img src="${imageSource}" alt="Imagem ${modelo}" class="veiculo-imagem" onerror="this.src='img/placeholder.png'; console.warn('Imagem não encontrada: ${imageSource}')">
                <p>Modelo: ${modelo}</p>
                <p>Cor: ${cor}</p>
                ${!isBicicleta ? `<p>Estado: ${ligado ? 'Ligado' : 'Desligado'}</p>` : ''}
                <p>Velocidade: ${velocidade.toFixed(isCaminhao ? 1 : 0)} km/h</p>
                ${isCarroEsportivo ? `<p>Turbo: ${veiculo.turboAtivado ? 'Ativado' : 'Desativado'}</p>` : ''}
                ${isCaminhao ? `<p>Capacidade: ${veiculo.capacidadeCarga.toFixed(0)} kg</p>` : ''}
                ${isCaminhao ? `<p>Carga Atual: ${veiculo.cargaAtual.toFixed(0)} kg</p>` : ''}
                <div class="barra-progresso-container"><div class="barra-progresso" style="width: 0%;"></div></div>
                <div class="controles-veiculo">
                    ${!isBicicleta ? `<button data-action="ligar" data-id="${id}">Ligar</button>` : ''}
                    ${!isBicicleta ? `<button data-action="desligar" data-id="${id}">Desligar</button>` : ''}
                    <button data-action="acelerar" data-id="${id}">Acelerar</button>
                    <button data-action="frear" data-id="${id}">Frear</button>
                    ${isCaminhao ? `<input type="number" id="${id}_quantidade-carga" data-input="carga" data-id="${id}" placeholder="Qtd (kg)" min="0" style="width:75px; padding:7px;">` : ''}
                    ${isCaminhao ? `<button data-action="carregar" data-id="${id}">Carregar</button>` : ''}
                    ${isCaminhao ? `<button data-action="descarregar" data-id="${id}">Descarregar</button>` : ''}
                    ${isCarroEsportivo ? `<button data-action="ativarTurbo" data-id="${id}">Ativar Turbo</button>` : ''}
                    ${isCarroEsportivo ? `<button data-action="desativarTurbo" data-id="${id}">Desativar Turbo</button>` : ''}
                    <button data-action="mudarCor" data-id="${id}">Mudar Cor</button>
                    ${isCarro ? `<button data-action="animar" data-id="${id}">Animar</button>` : ''}
                    ${!isBicicleta ? `<button data-action="detalhes" data-id="${id}">Detalhes / Manutenção</button>` : ''}
                    <button data-action="verDetalhesExtras" data-id="${id}">Ver DetalhesExtras</button>
                </div>
            </div>`;
    }catch(e){
        console.log("erro no gerarHTMLVeiculo")
    }
}

/**
 * Toca um som.
 */
function tocarSom(element) {
    try{
        console.log("[DEBUG] tocarSom() chamada.");
        if (element?.play) {
            element.currentTime = 0;
            element.play().catch(error => console.warn("Erro ao tocar som:", error.name, error.message));
        }
    }catch(e){
        console.log("erro no tocarSom")
    }
}

/**
 * Atualiza a barra de progresso.
 */
function atualizarBarraDeProgresso(element, percentage) {
    try{
        console.log("[DEBUG] atualizarBarraDeProgresso() chamada.");
        if (!element) return;

        const validPercentage = Math.max(0, Math.min(100, percentage));
        element.style.width = `${validPercentage}%`;
        element.style.backgroundColor =
            validPercentage > 85 ? '#dc3545' :
                validPercentage > 60 ? '#ffc107' :
                    '#0d6efd';
    }catch(e){
        console.log("erro no atualizarBarraDeProgresso")
    }
}
/**
 * Exibe uma notificação na tela.
 */
function exibirNotificacao(message, type = 'info', duration = 5000) {
    try{
        console.log("[DEBUG] exibirNotificacao() chamada.");
        if (!notificacoesContainer || !message) return;

        const notificationDiv = document.createElement('div');
        notificationDiv.className = `notificacao ${type}`;
        notificationDiv.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.className = 'close-btn';
        closeButton.setAttribute('aria-label', 'Fechar');
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            fecharNotificacao(notificationDiv);
        });
        notificationDiv.appendChild(closeButton);

        notificacoesContainer.prepend(notificationDiv);

        requestAnimationFrame(() => {
            notificationDiv.classList.add('show');
        });

        const timerId = setTimeout(() => {
            fecharNotificacao(notificationDiv);
        }, duration);
        notificationDiv.dataset.timerId = timerId;

        notificationDiv.addEventListener('click', (event) => {
            if (event.target === notificationDiv) {
                clearTimeout(timerId);
                fecharNotificacao(notificationDiv);
            }
        });
    }catch(e){
        console.log("erro no exibirNotificacao")
    }
}

/**
 * Fecha uma notificação.
 */
function fecharNotificacao(notificationDiv) {
    try{
        console.log("[DEBUG] fecharNotificacao() chamada.");
        if (!notificationDiv || !notificationDiv.parentNode) return;

        clearTimeout(notificationDiv.dataset.timerId);
        notificationDiv.style.opacity = '0';
        notificationDiv.style.transform = 'translateX(110%)';

        setTimeout(() => {
            if (notificationDiv.parentNode) notificationDiv.remove();
        }, 500);
    }catch(e){
        console.log("erro no fecharNotificacao")
    }
}

/**
 * Remove um veículo da garagem.
 */
function removerVeiculo(id) {
    try{
        console.log("[DEBUG] removerVeiculo() chamada com id =", id);
        if (!id || !veiculos[id]) {
            console.warn("Erro ao remover veículo: ID inválido:", id);
            exibirNotificacao("Erro: ID inválido.", 'erro');
            return;
        }

        const veiculo = veiculos[id];
        if (!confirm(`Remover ${veiculo.tipoVeiculo} ${veiculo.modelo}?`)) return;

        delete veiculos[id];
        salvarGaragemNoLocalStorage();
        renderizarGaragem();
        exibirNotificacao(`${veiculo.tipoVeiculo} ${veiculo.modelo} removido(a).`, 'sucesso');
    }catch(e){
        console.log("erro no removerVeiculo")
    }
}

/**
 * Alterna a visibilidade do formulário de adicionar veículo.
 */
function toggleFormAddVeiculo(show = true) {
    try{
        console.log("[DEBUG] toggleFormAddVeiculo() chamada com show =", show);
        if (!addVeiculoFormContainer) {
            console.error("Container do formulário de adicionar veículo não encontrado!");
            return;
        }

        addVeiculoFormContainer.style.display = show ? 'block' : 'none';
        if (btnMostrarFormAdd) {
            btnMostrarFormAdd.textContent = show ? 'Cancelar Adição' : 'Adicionar Novo Veículo +';
        }

        if (show && formAddVeiculo) {
            formAddVeiculo.reset();
            atualizarCamposOpcionaisFormAdd();
            addTipoSelect?.focus();
        }
    }catch(e){
        console.log("erro no toggleFormAddVeiculo")
    }
}

/**
 * Atualiza os campos opcionais do formulário de adicionar veículo.
 */
function atualizarCamposOpcionaisFormAdd() {
    try{
        console.log("[DEBUG] atualizarCamposOpcionaisFormAdd() chamada.");
        if (!addTipoSelect || !campoCapacidadeCarga || !addCapacidadeCargaInput) return;

        const selectedType = addTipoSelect.value;
        campoCapacidadeCarga.classList.toggle('visivel', selectedType === 'Caminhao');
        addCapacidadeCargaInput.required = selectedType === 'Caminhao';
        if (selectedType !== 'Caminhao') {
            addCapacidadeCargaInput.value = '';
        }
    }catch(e){
        console.log("erro no atualizarCamposOpcionaisFormAdd")
    }
}

/**
 * Manipula o envio do formulário de adicionar veículo.
 */
function handleAddVeiculoSubmit(event) {
    try{
        console.log("[DEBUG] handleAddVeiculoSubmit() chamada.");
        event.preventDefault();

        if (!addTipoSelect || !addModeloInput || !addCorInput) {
            console.error("Elementos do formulário não encontrados.");
            exibirNotificacao("Erro: Elementos do formulário não encontrados.", 'erro');
            return;
        }

        const tipo = addTipoSelect.value;
        const modelo = addModeloInput.value.trim();
        const cor = addCorInput.value.trim();

        if (!tipo || !modelo || !cor) {
            exibirNotificacao("Preencha Tipo, Modelo e Cor.", 'erro');
            if (!tipo) addTipoSelect.focus(); else if (!modelo) addModeloInput.focus(); else addCorInput.focus();
            return;
        }

        let novoVeiculo = null;
        const id = `${tipo.toLowerCase()}_${Date.now()}`;

        switch (tipo) {
            case 'Carro':
                novoVeiculo = new Carro(modelo, cor, id);
                break;
            case 'CarroEsportivo':
                novoVeiculo = new CarroEsportivo(modelo, cor, id);
                break;
            case 'Caminhao':
                const capacidadeCargaStr = addCapacidadeCargaInput.value;
                const capacidadeCarga = parseFloat(capacidadeCargaStr);

                if (capacidadeCargaStr === '' || isNaN(capacidadeCarga) || capacidadeCarga < 0) {
                    exibirNotificacao("Capacidade inválida.", 'erro');
                    addCapacidadeCargaInput.focus();
                    return;
                }
                novoVeiculo = new Caminhao(modelo, cor, id, capacidadeCarga);
                break;
            case 'Moto':
                novoVeiculo = new Moto(modelo, cor, id);
                break;
            case 'Bicicleta':
                novoVeiculo = new Bicicleta(modelo, cor, id);
                break;
            default:
                exibirNotificacao("Tipo inválido.", 'erro');
                return;
        }

        veiculos[id] = novoVeiculo;
        salvarGaragemNoLocalStorage();
        renderizarGaragem();
        toggleFormAddVeiculo(false);
        exibirNotificacao(`${tipo.replace(/([A-Z])/g, ' $1').trim()} ${modelo} adicionado!`, 'sucesso');
        tocarSom(sons.adicionar);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }catch(e){
        console.log("erro no handleAddVeiculoSubmit")
    }
}
/**
 * Renderiza a garagem, exibindo os veículos na tela.
 */
function renderizarGaragem() {
    try{
        console.log("[DEBUG] renderizarGaragem() chamada.");
        if (!garagemContainer || !garagemVaziaMsg) {
            console.error("Elementos da garagem não encontrados.");
            return;
        }

        garagemContainer.innerHTML = '';
        const veiculosArray = Object.values(veiculos);

        if (veiculosArray.length === 0) {
            garagemVaziaMsg.style.display = 'block';
        } else {
            garagemVaziaMsg.style.display = 'none';
            veiculosArray.forEach(veiculo => {
                if (veiculo && typeof veiculo === 'object') {
                    garagemContainer.innerHTML += gerarHTMLVeiculo(veiculo);
                } else {
                    console.warn("Veículo inválido encontrado:", veiculo);
                    exibirNotificacao("Erro: Veículo inválido encontrado.", 'erro');
                }
            });
        }
    }catch(e){
        console.log("erro no renderizarGaragem")
    }
}

/**
 * Manipula eventos de ações nos veículos (ligar, acelerar, etc.).
 */
function handleVehicleAction(event) {
    try{
        console.log("[DEBUG] handleVehicleAction() chamada.");
        const targetButton = event.target.closest('button[data-action][data-id]');
        if (!targetButton) return;

        const action = targetButton.dataset.action;
        const veiculoId = targetButton.dataset.id;
        const veiculo = veiculos[veiculoId];

        if (!veiculo) {
            console.error(`Veículo ID ${veiculoId} não encontrado para ação ${action}.`);
            exibirNotificacao("Erro: Veículo não encontrado.", "erro");
            return;
        }

        switch (action) {
            case 'ligar':
                veiculo.ligar();
                break;
            case 'desligar':
                veiculo.desligar();
                break;
            case 'acelerar':
                let incremento = 10;
                if (veiculo instanceof CarroEsportivo) incremento = 15;
                else if (veiculo instanceof Caminhao) incremento = 5;
                else if (veiculo instanceof Moto) incremento = 12;
                else if (veiculo instanceof Bicicleta) incremento = 3;
                veiculo.acelerar(incremento);
                break;
            case 'frear':
                let decremento = 7;
                if (veiculo instanceof CarroEsportivo) decremento = 10;
                else if (veiculo instanceof Caminhao) decremento = 4;
                else if (veiculo instanceof Moto) decremento = 9;
                else if (veiculo instanceof Bicicleta) decremento = 2;
                veiculo.frear(decremento);
                break;
            case 'mudarCor':
                const novaCor = prompt(`Nova cor para ${veiculo.modelo}:`, veiculo.cor);
                if (novaCor !== null) veiculo.mudarCor(novaCor);
                break;
            case 'remover':
                removerVeiculo(veiculoId);
                break;
            case 'detalhes':
                if (veiculo instanceof Bicicleta) {
                    exibirNotificacao("Bicicletas não têm detalhes/manutenção.", 'aviso');
                } else {
                    exibirInformacoesNaTela(veiculoId);
                }
                break;
            case 'verDetalhesExtras':
                exibirDetalhesExtras(veiculoId);
                break;
            case 'buzinar':
                tocarSom(sons.buzina);
                break;
            case 'ativarTurbo':
                if (veiculo instanceof CarroEsportivo) veiculo.ativarTurbo();
                break;
            case 'desativarTurbo':
                if (veiculo instanceof CarroEsportivo) veiculo.desativarTurbo();
                break;
            case 'carregar':
                if (veiculo instanceof Caminhao) {
                    const inputCarga = document.getElementById(`${veiculoId}_quantidade-carga`);
                    if (inputCarga) {
                        veiculo.carregar(inputCarga.value);
                        inputCarga.value = '';
                    } else {
                        console.warn(`Input carga ${veiculoId} não encontrado.`);
                    }
                }
                break;
            case 'descarregar':
                if (veiculo instanceof Caminhao) {
                    const inputCarga = document.getElementById(`${veiculoId}_quantidade-carga`);
                    if (inputCarga) {
                        veiculo.descarregar(inputCarga.value);
                        inputCarga.value = '';
                    } else {
                        console.warn(`Input carga ${veiculoId} não encontrado.`);
                    }
                }
                break;
            default:
                console.warn(`Ação desconhecida: ${action}`);
        }
    }catch(e){
        console.log("erro no handleVehicleAction")
    }
}

/**
 * Exibe as informações detalhadas do veículo no modal.
 */
function exibirInformacoesNaTela(veiculoId) {
    try{
        console.log("[DEBUG] exibirInformacoesNaTela() chamada com veiculoId =", veiculoId);
        if (!veiculoId || !veiculos[veiculoId]) {
            console.warn("Erro ao exibir detalhes: ID inválido:", veiculoId);
            exibirNotificacao("Erro: ID inválido.", 'erro');
            return;
        }

        const veiculo = veiculos[veiculoId];
        window.veiculoSelecionadoId = veiculoId; // Define o ID do veículo selecionado globalmente

        if (!informacoesVeiculoDiv || !detalhesContainer || !agendamentoFormContainer) {
            console.error("Elementos de detalhes não encontrados.");
            exibirNotificacao("Erro: Elementos de detalhes não encontrados.", 'erro');
            return;
        }

        informacoesVeiculoDiv.innerHTML = veiculo.exibirInformacoesDetalhes();
        detalhesContainer.style.display = 'block';
        document.body.classList.add('modal-aberto');
        agendamentoFormContainer.style.display = 'block'; // Exibe o formulário de agendamento
    }catch(e){
        console.log("erro no exibirInformacoesNaTela")
    }
}

/**
 * Manipula o envio do formulário de agendamento.
 */
function handleAgendamentoSubmit(event) {
    try{
        console.log("[DEBUG] handleAgendamentoSubmit() chamada.");
        event.preventDefault();

        const data = document.getElementById('agenda-data').value;
        const tipo = document.getElementById('agenda-tipo').value;
        const custo = parseFloat(document.getElementById('agenda-custo').value);
        const descricao = document.getElementById('agenda-descricao').value;

        if (!data || !tipo || isNaN(custo)) {
            exibirNotificacao("Preencha todos os campos do agendamento.", 'erro');
            return;
        }

        const manutencao = new Manutencao(data, tipo, custo, descricao);
        if (veiculos[window.veiculoSelecionadoId].adicionarManutencao(manutencao)) {
            exibirNotificacao("Manutenção agendada/registrada com sucesso!", 'sucesso');
            agendamentoFormContainer.style.display = 'none';
            formAgendamento.reset();
        } else {
            exibirNotificacao("Erro ao agendar/registrar manutenção.", 'erro');
        }
    }catch(e){
        console.log("erro no handleAgendamentoSubmit")
    }
}

/**
 * Busca os detalhes de um veículo na API simulada.
 */
async function buscarDetalhesVeiculoAPI(veiculoId) {
    try{
        console.log("[DEBUG] buscarDetalhesVeiculoAPI() chamada com veiculoId =", veiculoId);
        const response = await fetch('./dados_veiculos_api.json');
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.status}`);
        }
        const data = await response.json();
        const veiculo = data.find(v => v.id === veiculoId);
        return veiculo || null;
    }catch(e){
        console.log("erro no buscarDetalhesVeiculoAPI")
    }
}

/**
 * Exibe os detalhes extras de um veículo.
 */
async function exibirDetalhesExtras(veiculoId) {
    try{
        console.log("[DEBUG] exibirDetalhesExtras() chamada com veiculoId =", veiculoId);
        if (!veiculoId || !veiculos[veiculoId]) {
            console.warn("Erro ao exibir detalhes extras: ID inválido:", veiculoId);
            exibirNotificacao("Erro: ID inválido.", 'erro');
            return;
        }

        const veiculo = veiculos[veiculoId];
        const detalhes = await buscarDetalhesVeiculoAPI(veiculoId);

        if (detalhes) {
            const detalhesHTML = `
                <h3>Detalhes Extras - ${veiculo.modelo}</h3>
                <p>Valor FIPE: R$ ${detalhes.valorFIPE.toFixed(2)}</p>
                <p>Recall Pendente: ${detalhes.recallPendente ? 'Sim' : 'Não'}</p>
                <p>Dica: ${detalhes.dica}</p>
                <p>Seguradora Recomendada: ${detalhes.seguradoraRecomendada}</p>
            `;

            if (informacoesVeiculoDiv) {
                informacoesVeiculoDiv.innerHTML = detalhesHTML;
                detalhesContainer.style.display = 'block';
                document.body.classList.add('modal-aberto');
                agendamentoFormContainer.style.display = 'none'; // Oculta o formulário de agendamento
            } else {
                console.error("Container de informações do veículo não encontrado.");
                exibirNotificacao("Erro: Container de informações do veículo não encontrado.", 'erro');
            }
        } else {
            exibirNotificacao(`Detalhes extras não encontrados para ${veiculo.modelo}.`, 'aviso');
        }
    }catch(e){
        console.log("erro no exibirDetalhesExtras")
    }
}

async function buscarPrevisaoDetalhada(cidade) {
    try {
        console.log("[DEBUG] buscarPrevisaoDetalhada() chamada com cidade =", cidade);
        const apiKey = "b35a17a87dd4682376499cc8ba4658ab"; // Substitua pela sua chave!
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

        const response = await fetch(url);

        console.log("Status da resposta:", response.status); // ADICIONE ESTA LINHA

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro ao buscar previsão: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados da previsão detalhada:", data);
        return data;
    } catch (e) {
        console.log("erro no buscarPrevisaoDetalhada:", e); // Modifique esta linha
    }
}
/**
 * Exibe a previsão detalhada na interface do usuário.
 */
function exibirPrevisaoDetalhada(previsaoDiaria, nomeCidade) {
    try{
        console.log("[DEBUG] exibirPrevisaoDetalhada() chamada com nomeCidade =", nomeCidade);
        if (!previsaoTempoResultado) {
            console.error("Elemento de resultado da previsão do tempo não encontrado.");
            return;
        }

        previsaoTempoResultado.innerHTML = ''; // Limpa o conteúdo anterior

        if (!previsaoDiaria || previsaoDiaria.length === 0) {
            previsaoTempoResultado.textContent = "Nenhuma previsão encontrada para esta cidade.";
            return;
        }

        const titulo = document.createElement('h3');
        titulo.textContent = `Previsão para ${nomeCidade}`;
        previsaoTempoResultado.appendChild(titulo);

        const previsaoContainer = document.createElement('div');
        previsaoContainer.classList.add('previsao-tempo-container');
        previsaoTempoResultado.appendChild(previsaoContainer);

        previsaoDiaria.forEach(dia => {
            const previsaoDiaElement = document.createElement('div');
            previsaoDiaElement.classList.add('previsao-dia');

            const dataFormatada = new Date(dia.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const dataElement = document.createElement('h4');
            dataElement.textContent = dataFormatada;
            previsaoDiaElement.appendChild(dataElement);

            const iconeElement = document.createElement('img');
            iconeElement.src = `https://openweathermap.org/img/wn/${dia.icone}@2x.png`;
            iconeElement.alt = dia.descricao;
            previsaoDiaElement.appendChild(iconeElement);

            const descricaoElement = document.createElement('p');
            descricaoElement.textContent = dia.descricao;
            previsaoDiaElement.appendChild(descricaoElement);

            const temperaturasElement = document.createElement('p');
            temperaturasElement.textContent = `Min: ${dia.temp_min}°C / Max: ${dia.temp_max}°C`;
            previsaoDiaElement.appendChild(temperaturasElement);

            previsaoContainer.appendChild(previsaoDiaElement);
        });
    } catch (e) {
        console.log("erro no exibirPrevisaoDetalhada")
    }
}

/**
 * Manipula o clique no botão de verificar clima.
 */
async function handleVerificarClimaClick() {
    try {
        console.log("[DEBUG] handleVerificarClimaClick() chamada.");
        if (!destinoViagemInput || !previsaoTempoResultado) {
            console.error("Elementos de previsão do tempo não encontrados.");
            exibirNotificacao("Erro: Elementos de previsão do tempo não encontrados.", 'erro');
            return;
        }

        const cidade = destinoViagemInput.value;
        if (!cidade) {
            exibirNotificacao("Por favor, digite o nome de uma cidade.", 'aviso');
            return;
        }

        previsaoTempoResultado.textContent = "Buscando previsão...";

        const previsao = await buscarPrevisaoDetalhada(cidade);

        if (previsao) {
            const previsaoProcessada = processarDadosForecast(previsao);
            exibirPrevisaoDetalhada(previsaoProcessada, cidade);
        } else {
            previsaoTempoResultado.textContent = "Erro ao buscar previsão.";
        }
    } catch (e) {
    console.error("Erro no handleVerificarClimaClick:", e);
}
}

/**
 * Reconstroi um objeto veículo a partir de dados JSON.
 */
function reconstruirVeiculo(data) {
    try {
        console.log("[DEBUG] reconstruirVeiculo() chamada.");
        if (!data || typeof data !== 'object' || !data.tipoVeiculo) {
            console.error("Dados inválidos para reconstruir veículo:", data);
            return null;
        }

        let veiculo;
        switch (data.tipoVeiculo) {
            case 'Carro':
                veiculo = new Carro(data.modelo, data.cor, data.id);
                break;
            case 'CarroEsportivo':
                veiculo = new CarroEsportivo(data.modelo, data.cor, data.id);
                veiculo.turboAtivado = data.turboAtivado || false;
                break;
            case 'Caminhao':
                veiculo = new Caminhao(data.modelo, data.cor, data.id, data.capacidadeCarga);
                veiculo.cargaAtual = data.cargaAtual || 0;
                break;
            case 'Moto':
                veiculo = new Moto(data.modelo, data.cor, data.id);
                break;
            case 'Bicicleta':
                veiculo = new Bicicleta(data.modelo, data.cor, data.id);
                break;
            default:
                console.warn("Tipo de veículo desconhecido:", data.tipoVeiculo);
                return null;
        }

        veiculo.velocidade = data.velocidade || 0;
        veiculo.ligado = data.ligado || false;

        // Recriar o histórico de manutenção
        if (Array.isArray(data.historicoManutencao)) {
            veiculo.historicoManutencao = data.historicoManutencao.map(m => {
                const manutencao = new Manutencao(m.data, m.tipo, m.custo, m.descricao);
                return manutencao;
            });
        }

        return veiculo;
    } catch (e) {
        console.log("erro no reconstruirVeiculo");
    }
}


/**
 * Configura os event listeners para os elementos da página.
 */
function setupEventListeners() {
    try{
        console.log("[DEBUG] setupEventListeners() chamada.");

        btnMostrarFormAdd?.addEventListener('click', () => {
            console.log("[DEBUG] Botão 'Adicionar Novo Veículo' clicado!");
            toggleFormAddVeiculo(addVeiculoFormContainer.style.display !== 'block');
        });

        btnCancelarAdd?.addEventListener('click', () => toggleFormAddVeiculo(false));
        addTipoSelect?.addEventListener('change', atualizarCamposOpcionaisFormAdd);
        formAddVeiculo?.addEventListener('submit', handleAddVeiculoSubmit);

        garagemContainer?.addEventListener('click', handleVehicleAction);

        if (verificarClimaBtn) {
            verificarClimaBtn.addEventListener('click', async () => {
                console.log("Botão 'Verificar Clima' clicado!");
                const cidade = destinoViagemInput.value;
                if (!cidade) {
                    exibirNotificacao("Por favor, digite o nome de uma cidade.", 'aviso');
                    return;
                }

                previsaoTempoResultado.textContent = "Buscando previsão...";

                const previsao = await buscarPrevisaoDetalhada(cidade);

                if (previsao) {
                    const previsaoProcessada = processarDadosForecast(previsao);
                    exibirPrevisaoDetalhada(previsaoProcessada, cidade);
                } else {
                    previsaoTempoResultado.textContent = "Erro ao buscar previsão.";
                }
            });
        } else {
            console.warn("Botão 'Verificar Clima' não encontrado!");
        }

        if (btnFecharDetalhes) {
            btnFecharDetalhes.addEventListener('click', fecharDetalhes);
        } else {
            console.warn("Botão 'Fechar Detalhes' não encontrado.");
        }

        if (formAgendamento) {
            formAgendamento.addEventListener('submit', handleAgendamentoSubmit);
        } else {
            console.warn("Formulário de agendamento não encontrado.");
        }
    }catch(e){
        console.log("erro no setupEventListeners")
    }
}

/**
 * Funções de Inicialização
 */
function verificarAgendamentosProximos() {
    try{
        console.log("[DEBUG] verificarAgendamentosProximos() chamada.");
    }catch(e){
        console.log("erro no verificarAgendamentosProximos")
    }
    // (Por enquanto, não implementado)
}

/**
 * Fecha o modal de detalhes.
 */
function fecharDetalhes() {
    try{
        console.log("[DEBUG] fecharDetalhes() chamada.");
        detalhesContainer.style.display = 'none';
        document.body.classList.remove('modal-aberto');
    }catch(e){
        console.log("erro no fecharDetalhes")
    }
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[INICIO] Garagem Inteligente inicializando...");
    const carregou = carregarGaragemDoLocalStorage();
    console.log("[INICIO] Garagem carregada do LocalStorage:", carregou);
    renderizarGaragem();
    setupEventListeners();
    console.log("[INICIO] Garagem pronta!");
    exibirNotificacao("Garagem pronta!", "sucesso", 2500);
    console.log('Script FINAL');
});

function processarDadosForecast(dadosBrutosDaAPI) {
    console.log("[DEBUG] processarDadosForecast() chamada.");
    if (!dadosBrutosDaAPI || !dadosBrutosDaAPI.list || dadosBrutosDaAPI.list.length === 0) {
        console.warn("[DEBUG] Dados brutos inválidos ou vazios para processamento.");
        return []; // Retorna um array vazio se não há dados
    }

    const previsaoPorDia = {}; // Usaremos um objeto para agrupar previsões pelo dia
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera horas para comparação de data

    // A API retorna previsões a cada 3 horas. Precisamos selecionar uma por dia.
    // Vamos pegar a previsão do meio do dia ou próxima a ela para cada um dos próximos 5 dias.
    // Podemos simplesmente iterar pela lista e pegar a primeira ocorrência de cada novo dia.

    dadosBrutosDaAPI.list.forEach(item => {
        const data = new Date(item.dt * 1000); // Converter timestamp para Date
        const dataSemHora = new Date(data);
        dataSemHora.setHours(0, 0, 0, 0); // Zera hora para usar como chave

        const chaveDia = dataSemHora.toISOString().split('T')[0]; // Ex: '2023-10-27'

        // Se ainda não temos uma previsão para este dia E a data é hoje ou no futuro
        // (evita adicionar previsões do passado se o forecast inclui)
        if (!previsaoPorDia[chaveDia] && dataSemHora >= hoje) {
             // O forecast geralmente retorna 40 entradas (5 dias * 8 entradas de 3h)
             // Podemos limitar a 5 dias (incluindo hoje, se houver dados para hoje)
             if (Object.keys(previsaoPorDia).length < 5) {
                // Pega a temperatura min/max para o DIA todo (não só para este ponto no tempo)
                // Isso exige encontrar min/max entre todos os itens do mesmo dia na lista da API.
                // Para simplificar AGORA, vamos apenas usar a temperatura do item atual
                // e você pode melhorar isso depois buscando o min/max real do dia na lista.

                let temp_min_dia = item.main.temp; // Temp neste ponto
                let temp_max_dia = item.main.temp; // Temp neste ponto

                // Lógica mais completa para min/max do dia (opcional agora):
                const itensDoDia = dadosBrutosDaAPI.list.filter(it => {
                    const itDataSemHora = new Date(it.dt * 1000);
                    itDataSemHora.setHours(0, 0, 0, 0);
                    return itDataSemHora.toISOString().split('T')[0] === chaveDia;
                });

                if(itensDoDia.length > 0){
                     temp_min_dia = Math.min(...itensDoDia.map(it => it.main.temp_min));
                     temp_max_dia = Math.max(...itensDoDia.map(it => it.main.temp_max));
                }


                previsaoPorDia[chaveDia] = {
                    data: data,
                    temp: item.main.temp, // Temperatura neste ponto do tempo
                    temp_min: temp_min_dia, // Temperatura mínima do dia
                    temp_max: temp_max_dia, // Temperatura máxima do dia
                    descricao: item.weather[0].description,
                    icone: item.weather[0].icon
                };
                 console.log(`[DEBUG] Adicionado previsão para o dia ${chaveDia}.`);
             }
        }
    });

    // Converte o objeto agrupado de volta para um array e ordena por data
    const previsaoArray = Object.values(previsaoPorDia).sort((a, b) => a.data - b.data);
    console.log("[DEBUG] Processamento concluído. Retornando array de previsão:", previsaoArray);
    return previsaoArray;
}
// --- Correção de Escopo (Atribuição ao window) ---
window.carregarGaragemDoLocalStorage = carregarGaragemDoLocalStorage;
window.salvarGaragemNoLocalStorage = salvarGaragemNoLocalStorage;
window.gerarHTMLVeiculo = gerarHTMLVeiculo;
window.tocarSom = tocarSom;
window.atualizarBarraDeProgresso = atualizarBarraDeProgresso;
window.exibirNotificacao = exibirNotificacao;
window.fecharNotificacao = fecharNotificacao;
window.removerVeiculo = removerVeiculo;
window.toggleFormAddVeiculo = toggleFormAddVeiculo;
window.atualizarCamposOpcionaisFormAdd = atualizarCamposOpcionaisFormAdd;
window.handleAddVeiculoSubmit = handleAddVeiculoSubmit;
window.renderizarGaragem = renderizarGaragem;
window.handleVehicleAction = handleVehicleAction;
window.exibirInformacoesNaTela = exibirInformacoesNaTela;
window.handleAgendamentoSubmit = handleAgendamentoSubmit;
window.buscarDetalhesVeiculoAPI = buscarDetalhesVeiculoAPI;
window.exibirDetalhesExtras = exibirDetalhesExtras;
window.buscarPrevisaoDetalhada = buscarPrevisaoDetalhada;
window.processarDadosForecast = processarDadosForecast;
window.exibirPrevisaoDetalhada = exibirPrevisaoDetalhada;
window.handleVerificarClimaClick = handleVerificarClimaClick;
window.setupEventListeners = setupEventListeners;
window.verificarAgendamentosProximos = verificarAgendamentosProximos;
window.fecharDetalhes = fecharDetalhes;
window.reconstruirVeiculo = reconstruirVeiculo;
window.processarDadosForecast = processarDadosForecast;
window.exibirPrevisaoDetalhada = exibirPrevisaoDetalhada;
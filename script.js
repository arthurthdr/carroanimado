/**
 * Garagem Inteligente - Versão 3.1 (Corrigida)
 * Autor: Arthur (IFPR) e Assistente AI
 * Data: [Data Atual]
 * Descrição: Gerencia múltiplos veículos, adiciona/remove, controla ações,
 *            gerencia manutenções. Usa LocalStorage e renderização dinâmica.
 */

// --- Variáveis Globais e Elementos DOM ---
let veiculos = {};
let veiculoSelecionadoId = null;
const GARAGE_STORAGE_KEY = 'garagemInteligenteDadosV3';
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
const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo";
const agendamentoFormContainer = document.getElementById('agendamento-form-container');
const agendamentosFuturosContainer = document.getElementById('agendamentos-futuros-container');
const agendamentosFuturosConteudo = document.getElementById('agendamentos-futuros-conteudo');
const formAgendamento = document.getElementById('form-agendamento');
const btnFecharDetalhes = document.getElementById('fechar-detalhes');
const sons = { buzina: document.getElementById("som-buzina"), acelerar: document.getElementById("som-acelerar"), frear: document.getElementById("som-frear"), ligar: document.getElementById("som-ligar"), desligar: document.getElementById("som-desligar"), adicionar: document.getElementById("som-adicionar") };

// --- Funções Auxiliares ---
function tocarSom(el) { if (el?.play) { el.currentTime = 0; el.play().catch(e => console.warn("Som:", e.name, e.message)); } }
function atualizarBarraDeProgresso(el, p) { if (!el) return; let perc = Math.max(0, Math.min(100, p)); el.style.width = `${perc}%`; el.style.backgroundColor = perc > 85 ? '#dc3545' : perc > 60 ? '#ffc107' : '#0d6efd'; }
function exibirNotificacao(msg, tipo = 'info', dur = 5000) { if (!notificacoesContainer || !msg) return; const div = document.createElement('div'); div.className = `notificacao ${tipo}`; div.textContent = msg; const btn = document.createElement('button'); btn.innerHTML = '×'; btn.className = 'close-btn'; btn.setAttribute('aria-label', 'Fechar'); btn.onclick = (e) => { e.stopPropagation(); fecharNotificacao(div); }; div.appendChild(btn); notificacoesContainer.prepend(div); requestAnimationFrame(() => { div.classList.add('show'); }); const tId = setTimeout(() => { fecharNotificacao(div); }, dur); div.dataset.timerId = tId; div.addEventListener('click', (e) => { if (e.target === div) { clearTimeout(div.dataset.timerId); fecharNotificacao(div); } }); }
function fecharNotificacao(div) { if (!div || !div.parentNode) return; if (div.dataset.timerId) clearTimeout(div.dataset.timerId); div.style.opacity = '0'; div.style.transform = 'translateX(110%)'; setTimeout(() => { if (div.parentNode) div.remove(); }, 500); }

// --- Lógica Adição Veículo ---
function toggleFormAddVeiculo(show = true) {
    if(show){
        addVeiculoFormContainer.style.display = 'block';
        btnMostrarFormAdd.textContent = 'Cancelar Adição';
        formAddVeiculo.reset();
        atualizarCamposOpcionaisFormAdd();
        addTipoSelect.focus();
    } else {
        addVeiculoFormContainer.style.display = 'none';
        btnMostrarFormAdd.textContent = 'Adicionar Novo Veículo +';
    }
}

function atualizarCamposOpcionaisFormAdd() {
    const t = addTipoSelect.value;
    campoCapacidadeCarga.classList.remove('visivel');
    addCapacidadeCargaInput.required = false;
    if (t === 'Caminhao') {
        campoCapacidadeCarga.classList.add('visivel');
        addCapacidadeCargaInput.required = true;
    } else addCapacidadeCargaInput.value = '';
}

function handleAddVeiculoSubmit(e) {
    e.preventDefault();
    const t = addTipoSelect.value, m = addModeloInput.value.trim(), c = addCorInput.value.trim();
    if (!t || !m || !c) {
        exibirNotificacao("Preencha Tipo, Modelo e Cor.", 'erro');
        if(!t) addTipoSelect.focus(); else if(!m) addModeloInput.focus(); else addCorInput.focus();
        return;
    }
    const id = `${t.toLowerCase()}_${Date.now()}`;
    let nV = null;
    try {
        switch (t) {
            case 'Carro': nV = new Carro(m, c, id); break;
            case 'CarroEsportivo': nV = new CarroEsportivo(m, c, id); break;
            case 'Caminhao':
                const capS = addCapacidadeCargaInput.value, capN = parseFloat(capS);
                if (capS === '' || isNaN(capN) || capN < 0) {
                    exibirNotificacao("Capacidade inválida.", 'erro');
                    addCapacidadeCargaInput.focus();
                    return;
                }
                nV = new Caminhao(m, c, id, capN);
                break;
            case 'Moto': nV = new Moto(m, c, id); break;
            case 'Bicicleta': nV = new Bicicleta(m, c, id); break;
            default: exibirNotificacao("Tipo inválido.", 'erro'); return;
        }
        veiculos[id] = nV;
        salvarGaragemNoLocalStorage();
        renderizarGaragem();
        toggleFormAddVeiculo(false);
        exibirNotificacao(`${t.replace(/([A-Z])/g,' $1').trim()} ${m} adicionado!`, 'sucesso');
        tocarSom(sons.adicionar);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
        console.error("Erro criar/add veic:", err);
        exibirNotificacao(`Erro add: ${err.message}`, 'erro');
    }
}

// --- Persistência com LocalStorage ---
function parseManutencao(data) { if (!data || typeof data !== 'object') return null; try { const m = new Manutencao(data.data, data.tipo, data.custo, data.descricao); return m.validarDados() ? m : (console.warn("Manut inválida:", data), null); } catch (e) { console.error("Erro parsear manut:", e, data); return null; } }
function reconstruirVeiculo(data) {
    if (!data?.tipoVeiculo || !data?.id) {
        console.warn("Insuficiente reconstruir:", data);
        return null;
    }

    let v = null;
    const { modelo: m, cor: c, id, tipoVeiculo: t } = data;

    try {
        switch (t) {
            case 'Carro':
                v = new Carro(m, c, id);
                break;
            case 'CarroEsportivo':
                v = new CarroEsportivo(m, c, id);
                break;
            case 'Caminhao':
                const cap = data.capacidadeCarga ?? 5000;
                v = new Caminhao(m, c, id, cap);
                break;
            case 'Moto':
                v = new Moto(m, c, id);
                break;
            case 'Bicicleta':
                v = new Bicicleta(m, c, id);
                break;
            default:
                console.error(`Tipo desconhecido: ${t}`);
                return null;
        }

        if (data.velocidade !== undefined) {
            v.velocidade = parseFloat(data.velocidade) || 0;
        }

        if (!(v instanceof Bicicleta)) {
            v.ligado = !!data.ligado;
            v.historicoManutencao = Array.isArray(data.historicoManutencao)
                ? data.historicoManutencao
                    .map(parseManutencao)
                    .filter(i => i)
                    .sort((a, b) => (a.getDataObjeto() || 0) - (b.getDataObjeto() || 0))
                : [];
        }

        if (v instanceof CarroEsportivo && data.turboAtivado !== undefined) {
            v.turboAtivado = !!data.turboAtivado;
        }

        if (v instanceof Caminhao && data.cargaAtual !== undefined) {
            v.cargaAtual = parseFloat(data.cargaAtual) || 0;
        }

        return v;

    } catch (e) {
        console.error(`Erro CRÍTICO reconstruir ${t} (ID: ${id}):`, e, data);
        return null;
    }
}

function salvarGaragemNoLocalStorage() { try { const d = {}; Object.entries(veiculos).forEach(([id, v]) => { if (v) d[id] = v.toJSON(); }); localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(d)); } catch (e) { console.error("Erro GRAVE salvar LS:", e); if (e.name === 'QuotaExceededError') exibirNotificacao("Erro: Storage cheio!", 'erro', 1e4); else exibirNotificacao("Falha crítica salvar dados.", 'erro'); } }
function carregarGaragemDoLocalStorage() {
    const dS = localStorage.getItem(GARAGE_STORAGE_KEY);
    veiculos = {};
    if (!dS) {
        console.log("Nada salvo.");
        return false;
    }
    console.log("Dados encontrados. Parseando...");
    try {
        const dP = JSON.parse(dS);
        let r = 0, f = 0;
        Object.entries(dP).forEach(([id, data]) => {
            const v = reconstruirVeiculo(data);
            if (v) {
                veiculos[id] = v;
                r++;
            } else f++;
        });
        console.log(`Carregado: ${r} sucesso(s), ${f} falha(s).`);
        if (f > 0) exibirNotificacao(`${f} registro(s) corrompido(s) ignorado(s).`, 'aviso', 8e3);
        return r > 0 || f === 0;
    } catch (e) {
        console.error("ERRO CRÍTICO parse LS:", e);
        console.error("Dados:", dS.substring(0, 500) + '...');
        exibirNotificacao("Erro grave ler dados. Resetando.", 'erro', 1e4);
        try {
            localStorage.removeItem(GARAGE_STORAGE_KEY);
            console.log("Chave LS removida.");
        } catch (remE) {
            console.error("Erro remover chave:", remE);
        }
        veiculos = {};
        return false;
    }
}

// --- Renderização Dinâmica da Garagem ---
function gerarHTMLVeiculo(veiculo) {
    if (!veiculo || !veiculo.id) { console.error("Gerar HTML: veículo inválido:", veiculo); return ''; }
    const id = veiculo.id, eB = veiculo instanceof Bicicleta, eCa = veiculo instanceof Caminhao, eCr = veiculo instanceof Carro, eCE = veiculo instanceof CarroEsportivo;
    let imgN = veiculo.tipoVeiculo.toLowerCase(), imgE = '.jpg';
    if (veiculo.tipoVeiculo === 'Moto') imgE = '.webp'; if (veiculo.tipoVeiculo === 'CarroEsportivo') imgN = 'carroesportivo';
    const imgS = `img/${imgN}${imgE}`;

    return `
        <div id="${id}" class="veiculo-container" data-tipo="${veiculo.tipoVeiculo}">
            <button class="remover-veiculo-btn" data-action="remover" data-id="${id}" title="Remover ${veiculo.modelo}">×</button>
            <h2>${veiculo.tipoVeiculo.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <img src="${imgS}" alt="Imagem ${veiculo.modelo}" class="veiculo-imagem" onerror="this.src='img/placeholder.png'; console.warn('Img não encontrada: ${imgS}')">
            <p>Modelo: ${veiculo.modelo}</p>
            <p>Cor: ${veiculo.cor}</p>
            ${!eB ? `<p>Estado: ${veiculo.ligado ? 'Ligado':'Desligado'}</p>` : ''}
            <p>Velocidade: ${veiculo.velocidade.toFixed(eCa ? 1 : 0)} km/h</p>
            ${eCE ? `<p>Turbo: ${veiculo.turboAtivado ? 'Ativado':'Desativado'}</p>` : ''}
            ${eCa ? `<p>Capacidade: ${veiculo.capacidadeCarga.toFixed(0)} kg</p>` : ''}
            ${eCa ? `<p>Carga Atual: ${veiculo.cargaAtual.toFixed(0)} kg</p>` : ''}
            <div class="barra-progresso-container"><div class="barra-progresso" style="width: 0%;"></div></div>
            <div class="controles-veiculo">
                ${!eB ? `<button data-action="ligar" data-id="${id}">Ligar</button>`:''} ${!eB ? `<button data-action="desligar" data-id="${id}">Desligar</button>`:''}
                <button data-action="acelerar" data-id="${id}">Acelerar</button> <button data-action="frear" data-id="${id}">Frear</button>
                ${eCa ? `<input type="number" data-input="carga" data-id="${id}" placeholder="Qtd (kg)" min="0" style="width:75px; padding:7px;">`:''}
                ${eCa ? `<button data-action="carregar" data-id="${id}">Carregar</button>`:''} ${eCa ? `<button data-action="descarregar" data-id="${id}">Descarregar</button>`:''}
                ${eCE ? `<button data-action="ativarTurbo" data-id="${id}">Ativar Turbo</button>`:''} ${eCE ? `<button data-action="desativarTurbo" data-id="${id}">Desativar Turbo</button>`:''}
                <button data-action="mudarCor" data-id="${id}">Mudar Cor</button>
                ${eCr ? `<button data-action="animar" data-id="${id}">Animar</button>`:''}
                ${!eB ? `<button data-action="detalhes" data-id="${id}">Detalhes / Manutenção</button>`:''}
            </div>
        </div>`;
}

function renderizarGaragem() {
    if (!garagemContainer) { console.error("Container garagem não encontrado!"); return; }
    garagemContainer.innerHTML = '';
    const ids = Object.keys(veiculos);
    if (ids.length === 0) { garagemVaziaMsg.style.display = 'block'; console.log("Garagem vazia."); }
    else {
        garagemVaziaMsg.style.display = 'none'; console.log(`Renderizando ${ids.length} veículo(s)...`);
        ids.forEach(id => {
            const v = veiculos[id];
            if (v) {
                try {
                    const html = gerarHTMLVeiculo(v);
                    garagemContainer.insertAdjacentHTML('beforeend', html);
                } catch (e) { console.error(`Erro renderizar ${id}:`, e, v); garagemContainer.insertAdjacentHTML('beforeend', `<div class="veiculo-container error-card">Erro renderizar ID: ${id}</div>`); }
            } else console.warn(`ID ${id} inválido em 'veiculos'.`);
        });
        console.log("Renderização garagem concluída.");
    }
}

// --- Configuração dos Event Listeners ---
function setupEventListeners() {
    console.log("Configurando event listeners...");

    btnMostrarFormAdd?.addEventListener('click', () => {
         toggleFormAddVeiculo(addVeiculoFormContainer.style.display !== 'block');
    });
    btnCancelarAdd?.addEventListener('click', () => toggleFormAddVeiculo(false));
    addTipoSelect?.addEventListener('change', atualizarCamposOpcionaisFormAdd);
    formAddVeiculo?.addEventListener('submit', handleAddVeiculoSubmit);

    garagemContainer?.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button[data-action][data-id]');
        if (targetButton) {
            const action = targetButton.dataset.action;
            const veiculoId = targetButton.dataset.id;
            const veiculo = veiculos[veiculoId];

            if (!veiculo) { console.error(`Listener: Veículo ID ${veiculoId} não encontrado p/ ação ${action}.`); exibirNotificacao("Erro: Veículo não encontrado.", "erro"); return; }

            if (action === 'remover') {
                console.log(`[LISTENER] Clique detectado para REMOVER veículo ID: ${veiculoId}`);
            }

            try {
                switch (action) {
                    case 'ligar':           veiculo.ligar(); break;
                    case 'desligar':        veiculo.desligar(); break;
                    case 'acelerar':        let inc=10; if(veiculo instanceof CarroEsportivo) inc=15; else if(veiculo instanceof Caminhao) inc=5; else if(veiculo instanceof Moto) inc=12; else if(veiculo instanceof Bicicleta) inc=3; veiculo.acelerar(inc); break;
                    case 'frear':           let dec=7; if(veiculo instanceof CarroEsportivo) dec=10; else if(veiculo instanceof Caminhao) dec=4; else if(veiculo instanceof Moto) dec=9; else if(veiculo instanceof Bicicleta) dec=2; veiculo.frear(dec); break;
                    case 'mudarCor':        const nCor = prompt(`Nova cor para ${veiculo.modelo}:`, veiculo.cor); if (nCor !== null) veiculo.mudarCor(nCor); break;
                    case 'remover':         removerVeiculo(veiculoId); break; // Chama a função
                    case 'detalhes':        if (veiculo instanceof Bicicleta) exibirNotificacao("Bikes não têm detalhes/manut.", 'aviso'); else exibirInformacoesNaTela(veiculoId); break;
                    case 'buzinar':         tocarSom(sons.buzina); break;
                    case 'ativarTurbo':     if (veiculo instanceof CarroEsportivo) veiculo.ativarTurbo(); break;
                    case 'desativarTurbo':  if (veiculo instanceof CarroEsportivo) veiculo.desativarTurbo(); break;
                    case 'carregar':
                        if (veiculo instanceof Caminhao) {
                            const inp = document.getElementById(`${veiculoId}_quantidade-carga`);
                            if(inp) {
                                veiculo.carregar(inp.value);
                                inp.value='';
                            } else console.warn(`Input carga ${veiculoId} não achado.`);
                        }
                        break;
                    case 'descarregar':
                         if (veiculo instanceof Caminhao) {
                            const inp = document.getElementById(`${veiculoId}_quantidade-carga`);
                            if(inp) {
                                veiculo.descarregar(inp.value);
                                inp.value='';
                            } else console.warn(`Input carga ${veiculoId} não achado.`);
                        }
                        break;
                     case 'animar':
                         if (veiculo instanceof Carro) {
                            const card = document.getElementById(veiculoId), btn = targetButton;
                            if (card && btn) {
                                const isActive = card.classList.toggle("mover-animacao");
                                btn.textContent = isActive ? "Parar Animação" : "Animar";
                            }
                         }
                         break;
                    default: console.warn(`Ação delegada desconhecida: ${action}`);
                }
            } catch (e) { console.error(`Erro executar ação "${action}" p/ ${veiculoId}:`, e); exibirNotificacao(`Erro ao ${action}.`, 'erro'); }
        }
    });

    btnFecharDetalhes?.addEventListener('click', fecharDetalhes);
    detalhesContainer?.addEventListener('click', (e) => { if (e.target === detalhesContainer) fecharDetalhes(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && detalhesContainer.style.display === 'block') fecharDetalhes(); });
    formAgendamento?.addEventListener('submit', handleAgendamentoSubmit);
    console.log("Event listeners configurados.");
}

// --- Ponto de Entrada Principal ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("=============================================");
    console.log("DOM Carregado. Iniciando Garagem Inteligente...");
    console.log("=============================================");

    try {
        // **Garante que o modal comece fechado**
        veiculoSelecionadoId = null; // Limpa qualquer ID selecionado remanescente
        if (detalhesContainer) {
            detalhesContainer.style.display = 'none'; // Força o fechamento visual
            console.log("[INIT] Modal de detalhes garantido como fechado.");
        } else {
            console.warn("[INIT] Container de detalhes não encontrado no DOM inicial.");
        }
        document.body.classList.remove('modal-aberto'); // Garante remoção da classe overlay

        // 1. Carregar Dados
        console.log("[INIT] Carregando dados do LocalStorage...");
        carregarGaragemDoLocalStorage();

        // 2. Renderizar Interface
        console.log("[INIT] Renderizando a garagem...");
        renderizarGaragem();

        // 3. Configurar Listeners
        console.log("[INIT] Configurando event listeners...");
        setupEventListeners();

        // 4. Verificar Agendamentos
        console.log("4 - VERIFICANDO AGENDAMENTOS PROXIMOS");
        verificarAgendamentosProximos();

        console.log("=============================================");
        console.log("[INIT] Garagem Inteligente inicializada!");
        console.log("=============================================");
        exibirNotificacao("Garagem pronta!", "sucesso", 2500);

    } catch (initError) {
        console.error("!!!!!!!!!!!!!!!! ERRO CRÍTICO INICIALIZAÇÃO !!!!!!!!!!!!!!!!", initError);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'background:red; color:white; padding:20px; text-align:center; font-weight:bold; position:fixed; top:0; left:0; width:100%; z-index:9999;';
        errorDiv.textContent = `ERRO FATAL: ${initError.message}. Verifique console (F12) e limpe dados do site.`;
        document.body.prepend(errorDiv);
    }

    // --- Listeners Globais de Erro ---
    window.addEventListener('error', (e) => { console.error('** Erro Global:', e.error, e.message, '@', e.filename, ':', e.lineno); });
    window.addEventListener('unhandledrejection', (e) => { console.error('** Promise Rejeitada:', e.reason); });
});

// --- Funções Persistência LocalStorage ---
function salvarGaragemNoLocalStorage() { try { const d = {}; Object.entries(veiculos).forEach(([id, v]) => { if (v) d[id] = v.toJSON(); }); localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(d)); } catch (e) { console.error("Erro GRAVE salvar LS:", e); if (e.name === 'QuotaExceededError') exibirNotificacao("Erro: Storage cheio!", 'erro', 1e4); else exibirNotificacao("Falha crítica salvar dados.", 'erro'); } }

console.log('Script FINAL');
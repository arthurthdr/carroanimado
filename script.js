/**
 * Garagem Inteligente - Versão 3.1 (Confirmada)
 * Autor: Arthur (IFPR) e Assistente AI
 * Data: [Data Atual]
 * Descrição: Gerencia múltiplos veículos, adiciona/remove, controla ações,
 *            gerencia manutenções. Usa LocalStorage e renderização dinâmica.
 * Changelog (3.1):
 *  - Garante que modal de detalhes esteja fechado na inicialização.
 *  - Reforça CSS e lógica para garantir visibilidade/funcionalidade do botão remover.
 *  - Adiciona logs de depuração para remoção e inicialização.
 *  - Garante que ID selecionado seja nulo ao reiniciar.
 */

// --- Classe Manutencao (Sem alterações) ---
class Manutencao {
    constructor(data, tipo, custo, descricao = '') { this.data = data; this.tipo = tipo ? String(tipo).trim() : ''; this.custo = parseFloat(custo) || 0; this.descricao = descricao ? String(descricao).trim() : ''; }
    getDataObjeto() { if (!this.data) return null; const dateObj = new Date(`${this.data}T00:00:00`); if (!isNaN(dateObj.getTime())) return dateObj; console.warn(`Formato data inválido: ${this.data}`); return null; }
    validarDados() { if (!this.getDataObjeto()) { console.error(`Validação Manut.: Data inválida (${this.data})`); return false; } if (!this.tipo) { console.error(`Validação Manut.: Tipo vazio`); return false; } if (isNaN(this.custo) || this.custo < 0) { console.error(`Validação Manut.: Custo inválido (${this.custo})`); return false; } return true; }
    formatarParaExibicao(formatoData = 'DD/MM/AAAA') { let df = 'Data Inválida'; const dO = this.getDataObjeto(); if (dO) { const dia = String(dO.getUTCDate()).padStart(2, '0'); const mes = String(dO.getUTCMonth() + 1).padStart(2, '0'); const ano = dO.getUTCFullYear(); df = (formatoData === 'DD/MM/AAAA') ? `${dia}/${mes}/${ano}` : `${ano}-${mes}-${dia}`; } const tf = this.tipo || 'Tipo Inválido'; const cf = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); let r = `${tf} em ${df} - ${cf}`; if (this.descricao) r += ` (Desc: ${this.descricao})`; return r; }
    toJSON() { return { data: this.data, tipo: this.tipo, custo: this.custo, descricao: this.descricao }; }
}

// --- Classe Veiculo (Base) (Sem alterações) ---
class Veiculo {
    constructor(modelo, cor, tipoVeiculo, id) { if (!tipoVeiculo || !['Carro', 'CarroEsportivo', 'Caminhao', 'Moto', 'Bicicleta'].includes(tipoVeiculo)) throw new Error("Tipo inválido."); if (!id || typeof id !== 'string' || id.trim() === '') throw new Error("ID inválido."); this.modelo = modelo ? String(modelo).trim() : 'Desconhecido'; this.cor = cor ? String(cor).trim() : 'Desconhecida'; this.tipoVeiculo = tipoVeiculo; this.id = id; this.ligado = false; this.velocidade = 0; this.historicoManutencao = []; }
    _findElement(suf) { return document.getElementById(`${this.id}_${suf}`); }
    ligar() { if (this instanceof Bicicleta) { exibirNotificacao("Bicicletas não ligam.", 'aviso'); return; } if (this.ligado) { exibirNotificacao(`${this.modelo} já ligado.`, 'aviso'); return; } this.ligado = true; console.log(`${this.tipoVeiculo} ${this.modelo} (${this.id}) ligado!`); tocarSom(sons.ligar); this.atualizarEstadoNaTela(); salvarGaragemNoLocalStorage(); }
    desligar() { if (this instanceof Bicicleta) return; if (!this.ligado) { exibirNotificacao(`${this.modelo} já desligado.`, 'aviso'); return; } if (this.velocidade > 0) { exibirNotificacao(`Pare ${this.modelo} (${this.id})!`, 'erro'); return; } this.ligado = false; console.log(`${this.tipoVeiculo} ${this.modelo} (${this.id}) desligado!`); tocarSom(sons.desligar); this.atualizarEstadoNaTela(); this.atualizarVelocidadeNaTela(); salvarGaragemNoLocalStorage(); }
    acelerar(incBase) { const eBicicleta = this instanceof Bicicleta; if (!eBicicleta && !this.ligado) { exibirNotificacao(`Ligue ${this.modelo} (${this.id})!`, 'erro'); return; } let inc = incBase, vMax = this.getVelocidadeMaxima(), boost = 1, fCarga = 1; if (this instanceof CarroEsportivo && this.turboAtivado) boost = 1.5; else if (this instanceof Caminhao) fCarga = this.capacidadeCarga > 0 ? Math.max(0.4, 1 - (this.cargaAtual / this.capacidadeCarga) * 0.6) : 1; const proxV = this.velocidade + (inc * boost * fCarga); if (this.velocidade >= vMax) return; this.velocidade = Math.min(proxV, vMax); console.log(`Acelerando ${this.modelo} (${this.id})! Vel: ${this.velocidade.toFixed(1)}` + (this instanceof CarroEsportivo && this.turboAtivado ? " (TURBO!)" : "")); if (!eBicicleta) tocarSom(sons.acelerar); this.atualizarVelocidadeNaTela(); }
    frear(dec) { if (this.velocidade === 0) return; this.velocidade = Math.max(0, this.velocidade - dec); console.log(`Freando ${this.modelo} (${this.id})! Vel: ${this.velocidade.toFixed(1)}`); if (this.velocidade > 0 && !(this instanceof Bicicleta)) tocarSom(sons.frear); this.atualizarVelocidadeNaTela(); }
    mudarCor(nCor) { const corT = typeof nCor === 'string' ? nCor.trim() : ''; if (corT && corT.toLowerCase() !== this.cor.toLowerCase()) { this.cor = corT; console.log(`Cor ${this.modelo} (${this.id}) -> ${this.cor}`); this.atualizarCorNaTela(); salvarGaragemNoLocalStorage(); exibirNotificacao(`Cor alterada para ${this.cor}.`, 'sucesso'); if (veiculoSelecionadoId === this.id) exibirInformacoesNaTela(this.id); } else if (!corT) exibirNotificacao("Cor inválida.", 'erro'); else exibirNotificacao(`Já é ${this.cor}.`, 'aviso'); }
    getVelocidadeMaxima() { return 100; }
    adicionarManutencao(mObj) { if (!(mObj instanceof Manutencao)) { console.error(`Objeto inválido addManut ${this.id}.`); exibirNotificacao(`Erro interno add manut ${this.modelo}.`, 'erro'); return false; } if (this instanceof Bicicleta) { exibirNotificacao("Bikes não têm manut.", 'aviso'); return false; } if (mObj.validarDados()) { this.historicoManutencao.push(mObj); this.historicoManutencao.sort((a, b) => (a.getDataObjeto() || 0) - (b.getDataObjeto() || 0)); console.log(`Manut adicionada a ${this.id}: ${mObj.formatarParaExibicao()}`); salvarGaragemNoLocalStorage(); if (veiculoSelecionadoId === this.id) exibirInformacoesNaTela(this.id); exibirNotificacao(`Manut p/ ${this.modelo} agendada!`, 'sucesso'); verificarAgendamentosProximos(); return true; } else { exibirNotificacao(`Erro add manut ${this.modelo}: Dados inválidos.`, 'erro'); return false; } }
    _filtrarEOrdenarManutencoes(fData) { if (this instanceof Bicicleta || !this.historicoManutencao.length) return []; return this.historicoManutencao.filter(m => { const dM = m.getDataObjeto(); return dM && fData(dM); }).sort((a, b) => (b.getDataObjeto() || 0) - (a.getDataObjeto() || 0)); }
    getHistoricoManutencaoFormatado() { const hoje = new Date(); hoje.setHours(0,0,0,0); const hist = this._filtrarEOrdenarManutencoes(dM => dM <= hoje); if (!hist.length) return "Nenhum registro passado."; return hist.map(m => `- ${m.formatarParaExibicao()}`).join('\n'); }
    getAgendamentosFuturosFormatado() { const hoje = new Date(); hoje.setHours(0,0,0,0); const fut = this._filtrarEOrdenarManutencoes(dM => dM > hoje); fut.sort((a, b) => (a.getDataObjeto() || 0) - (b.getDataObjeto() || 0)); if (!fut.length) return "Nenhum agendamento futuro."; return fut.map(m => `- ${m.formatarParaExibicao()}`).join('\n'); }
    atualizarVelocidadeNaTela() { const elV = this._findElement('velocidade'); const elB = this._findElement('barra-progresso'); if (elV) elV.textContent = this.velocidade.toFixed(this instanceof Caminhao ? 1 : 0); if (elB) { const vMax = this.getVelocidadeMaxima(); const p = (vMax > 0 && this.velocidade > 0) ? Math.min(100, (this.velocidade / vMax) * 100) : 0; atualizarBarraDeProgresso(elB, p); } }
    atualizarEstadoNaTela() { if (this instanceof Bicicleta) return; const elE = this._findElement('estado'); if (elE) { elE.textContent = this.ligado ? "Ligado" : "Desligado"; elE.style.color = this.ligado ? "green" : "red"; elE.style.fontWeight = this.ligado ? "bold" : "normal"; } }
    atualizarCorNaTela() { const elC = this._findElement('cor'); if (elC) elC.textContent = this.cor; }
    atualizarCardCompletoNaTela() { const elM = this._findElement('modelo'); const elC = this._findElement('cor'); if (elM) elM.textContent = this.modelo; if (elC) elC.textContent = this.cor; this.atualizarCorNaTela(); this.atualizarEstadoNaTela(); this.atualizarVelocidadeNaTela(); if (this instanceof CarroEsportivo) this.atualizarEstadoTurboNaTela(); if (this instanceof Caminhao) this.atualizarCargaNaTela(); }
    adicionarBotaoBuzina() { if (this instanceof Bicicleta) return; const cont = this._findElement('controles'); if (cont && !cont.querySelector('button[data-action="buzinar"]')) { const btn = document.createElement("button"); btn.textContent = "Buzinar"; btn.className = 'buzina-btn'; btn.dataset.action = 'buzinar'; btn.dataset.id = this.id; const ref = cont.querySelector('button[data-action="mudarCor"]'); if (ref) cont.insertBefore(btn, ref); else cont.appendChild(btn); } }
    exibirInformacoesDetalhes() { const eB = this instanceof Bicicleta; const eC = this instanceof Caminhao; const eCE = this instanceof CarroEsportivo; let i = `<p><strong>Modelo:</strong> ${this.modelo}<br><strong>Cor:</strong> ${this.cor}<br>`; if (!eB) i += `<strong>Estado:</strong> <span style="color:${this.ligado ? 'green' : 'red'}; font-weight:bold;">${this.ligado ? "Ligado" : "Desligado"}</span><br>`; i += `<strong>Velocidade:</strong> ${this.velocidade.toFixed(eC ? 1 : 0)} km/h</p>`; if (eCE) i += `<p><strong>Turbo:</strong> <span style="color:${this.turboAtivado ? 'orange' : 'grey'}; font-weight:bold;">${this.turboAtivado ? "Ativado" : "Desativado"}</span></p>`; if (eC) i += `<p><strong>Capacidade:</strong> ${this.capacidadeCarga.toFixed(0)} kg<br><strong>Carga Atual:</strong> ${this.cargaAtual.toFixed(0)} kg</p>`; return i; }
    toJSON() { const data = { modelo: this.modelo, cor: this.cor, tipoVeiculo: this.tipoVeiculo, id: this.id, velocidade: this.velocidade }; if (!(this instanceof Bicicleta)) { data.ligado = this.ligado; data.historicoManutencao = this.historicoManutencao.map(m => m.toJSON()); } if (this instanceof CarroEsportivo) data.turboAtivado = this.turboAtivado; else if (this instanceof Caminhao) { data.capacidadeCarga = this.capacidadeCarga; data.cargaAtual = this.cargaAtual; } return data; }
}

// --- Subclasses (Sem alterações) ---
class Carro extends Veiculo { constructor(m, c, id) { super(m, c, 'Carro', id); } getVelocidadeMaxima() { return 180; } }
class CarroEsportivo extends Veiculo { constructor(m, c, id) { super(m, c, 'CarroEsportivo', id); this.turboAtivado = false; } getVelocidadeMaxima() { return this.turboAtivado ? 250 : 200; } ativarTurbo() { if (!this.ligado){exibirNotificacao(`Ligue ${this.modelo}!`, 'erro'); return;} if (this.turboAtivado){exibirNotificacao("Turbo já ON.", 'aviso'); return;} this.turboAtivado = true; this.atualizarEstadoTurboNaTela(); console.log(`Turbo ON ${this.id}!`); exibirNotificacao("Turbo Ativado!", 'aviso'); salvarGaragemNoLocalStorage(); this.atualizarDetalhesVisiveis(); } desativarTurbo() { if (!this.turboAtivado) return; this.turboAtivado = false; this.atualizarEstadoTurboNaTela(); console.log(`Turbo OFF ${this.id}.`); salvarGaragemNoLocalStorage(); this.atualizarDetalhesVisiveis(); } atualizarEstadoTurboNaTela() { const el = this._findElement('turbo'); if(el){ el.textContent = this.turboAtivado ? "Ativado" : "Desativado"; el.style.color = this.turboAtivado ? "orange" : "grey"; el.style.fontWeight = this.turboAtivado ? "bold" : "normal"; }} atualizarDetalhesVisiveis() { if (veiculoSelecionadoId === this.id && detalhesContainer.style.display === 'block') exibirInformacoesNaTela(this.id); } }
class Caminhao extends Veiculo { constructor(m, c, id, cap) { super(m, c, 'Caminhao', id); this.capacidadeCarga = Math.max(0, parseFloat(cap) || 5000); this.cargaAtual = 0; } getVelocidadeMaxima() { return 120; } carregar(qtd) { if (this.ligado){exibirNotificacao(`Desligue ${this.modelo}!`, 'erro'); return;} const qN = parseFloat(qtd); if (isNaN(qN) || qN <= 0){exibirNotificacao("Qtd inválida.", 'erro'); return;} const esp = this.capacidadeCarga - this.cargaAtual; if (esp <= 0){exibirNotificacao(`${this.modelo} cheio.`, 'aviso'); return;} const cR = Math.min(qN, esp); this.cargaAtual += cR; this.atualizarCargaNaTela(); console.log(`Caminhao ${this.id}: +${cR.toFixed(1)}kg. Atual: ${this.cargaAtual.toFixed(1)}kg`); exibirNotificacao(`+${cR.toFixed(0)}kg. Total: ${this.cargaAtual.toFixed(0)}kg.`, 'sucesso'); salvarGaragemNoLocalStorage(); this.atualizarDetalhesVisiveis(); } descarregar(qtd) { if (this.ligado){exibirNotificacao(`Desligue ${this.modelo}!`, 'erro'); return;} const qN = parseFloat(qtd); if (isNaN(qN) || qN <= 0){exibirNotificacao("Qtd inválida.", 'erro'); return;} if (this.cargaAtual <= 0){exibirNotificacao(`${this.modelo} vazio.`, 'aviso'); return;} const dR = Math.min(qN, this.cargaAtual); this.cargaAtual -= dR; this.atualizarCargaNaTela(); console.log(`Caminhao ${this.id}: -${dR.toFixed(1)}kg. Atual: ${this.cargaAtual.toFixed(1)}kg`); exibirNotificacao(`-${dR.toFixed(0)}kg. Resta: ${this.cargaAtual.toFixed(0)}kg.`, 'sucesso'); salvarGaragemNoLocalStorage(); this.atualizarDetalhesVisiveis(); } atualizarCargaNaTela() { const elC = this._findElement('carga-atual'); const elCap = this._findElement('capacidade-carga'); if(elC) elC.textContent = this.cargaAtual.toFixed(0); if(elCap) elCap.textContent = this.capacidadeCarga.toFixed(0); } atualizarDetalhesVisiveis() { if (veiculoSelecionadoId === this.id && detalhesContainer.style.display === 'block') exibirInformacoesNaTela(this.id); } }
class Moto extends Veiculo { constructor(m, c, id) { super(m, c, 'Moto', id); } getVelocidadeMaxima() { return 160; } }
class Bicicleta extends Veiculo { constructor(m, c, id) { super(m, c, 'Bicicleta', id); this.ligado = false; } getVelocidadeMaxima() { return 35; } ligar() { exibirNotificacao("Bikes não ligam.", 'aviso'); } desligar() {} adicionarManutencao() { exibirNotificacao("Bikes não têm manut.", 'aviso'); return false; } getHistoricoManutencaoFormatado() { return "N/A"; } getAgendamentosFuturosFormatado() { return "N/A"; } adicionarBotaoBuzina() {} }

// --- Variáveis Globais e Elementos DOM (Sem alterações) ---
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
const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
const agendamentoFormContainer = document.getElementById('agendamento-form-container');
const agendamentosFuturosContainer = document.getElementById('agendamentos-futuros-container');
const agendamentosFuturosConteudo = document.getElementById('agendamentos-futuros-conteudo');
const formAgendamento = document.getElementById('form-agendamento');
const btnFecharDetalhes = document.getElementById('fechar-detalhes');
const sons = { buzina: document.getElementById("som-buzina"), acelerar: document.getElementById("som-acelerar"), frear: document.getElementById("som-frear"), ligar: document.getElementById("som-ligar"), desligar: document.getElementById("som-desligar"), adicionar: document.getElementById("som-adicionar") };

// --- Funções Auxiliares (Sem alterações) ---
function tocarSom(el) { if (el?.play) { el.currentTime = 0; el.play().catch(e => console.warn("Som:", e.name, e.message)); } }
function atualizarBarraDeProgresso(el, p) { if (!el) return; let perc = Math.max(0, Math.min(100, p)); el.style.width = `${perc}%`; el.style.backgroundColor = perc > 85 ? '#dc3545' : perc > 60 ? '#ffc107' : '#0d6efd'; }
function exibirNotificacao(msg, tipo = 'info', dur = 5000) { if (!notificacoesContainer || !msg) return; const div = document.createElement('div'); div.className = `notificacao ${tipo}`; div.textContent = msg; const btn = document.createElement('button'); btn.innerHTML = '×'; btn.className = 'close-btn'; btn.setAttribute('aria-label', 'Fechar'); btn.onclick = (e) => { e.stopPropagation(); fecharNotificacao(div); }; div.appendChild(btn); notificacoesContainer.prepend(div); requestAnimationFrame(() => { div.classList.add('show'); }); const tId = setTimeout(() => { fecharNotificacao(div); }, dur); div.dataset.timerId = tId; div.addEventListener('click', (e) => { if (e.target === div) { clearTimeout(div.dataset.timerId); fecharNotificacao(div); } }); }
function fecharNotificacao(div) { if (!div || !div.parentNode) return; if (div.dataset.timerId) clearTimeout(div.dataset.timerId); div.style.opacity = '0'; div.style.transform = 'translateX(110%)'; setTimeout(() => { if (div.parentNode) div.remove(); }, 500); }

// --- Persistência com LocalStorage (Sem alterações) ---
function parseManutencao(data) { if (!data || typeof data !== 'object') return null; try { const m = new Manutencao(data.data, data.tipo, data.custo, data.descricao); return m.validarDados() ? m : (console.warn("Manut inválida:", data), null); } catch (e) { console.error("Erro parsear manut:", e, data); return null; } }
function reconstruirVeiculo(data) { if (!data?.tipoVeiculo || !data?.id) { console.warn("Insuficiente reconstruir:", data); return null; } let v = null; const { modelo: m, cor: c, id, tipoVeiculo: t } = data; try { switch (t) { case 'Carro': v = new Carro(m, c, id); break; case 'CarroEsportivo': v = new CarroEsportivo(m, c, id); break; case 'Caminhao': const cap = data.capacidadeCarga ?? 5000; v = new Caminhao(m, c, id, cap); break; case 'Moto': v = new Moto(m, c, id); break; case 'Bicicleta': v = new Bicicleta(m, c, id); break; default: console.error(`Tipo desconhecido: ${t}`); return null; } if (data.velocidade !== undefined) v.velocidade = parseFloat(data.velocidade) || 0; if (!(v instanceof Bicicleta)) { v.ligado = !!data.ligado; v.historicoManutencao = Array.isArray(data.historicoManutencao) ? data.historicoManutencao.map(parseManutencao).filter(i => i).sort((a, b) => (a.getDataObjeto() || 0) - (b.getDataObjeto() || 0)) : []; } if (v instanceof CarroEsportivo && data.turboAtivado !== undefined) v.turboAtivado = !!data.turboAtivado; if (v instanceof Caminhao && data.cargaAtual !== undefined) v.cargaAtual = parseFloat(data.cargaAtual) || 0; return v; } catch (e) { console.error(`Erro CRÍTICO reconstruir ${t} (ID: ${id}):`, e, data); return null; } }
function salvarGaragemNoLocalStorage() { try { const d = {}; Object.entries(veiculos).forEach(([id, v]) => { if (v) d[id] = v.toJSON(); }); localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(d)); } catch (e) { console.error("Erro GRAVE salvar LS:", e); if (e.name === 'QuotaExceededError') exibirNotificacao("Erro: Storage cheio!", 'erro', 1e4); else exibirNotificacao("Falha crítica salvar dados.", 'erro'); } }
function carregarGaragemDoLocalStorage() { const dS = localStorage.getItem(GARAGE_STORAGE_KEY); veiculos = {}; if (!dS) { console.log("Nada salvo."); return false; } console.log("Dados encontrados. Parseando..."); try { const dP = JSON.parse(dS); let r = 0, f = 0; Object.entries(dP).forEach(([id, data]) => { const v = reconstruirVeiculo(data); if (v) { veiculos[id] = v; r++; } else f++; }); console.log(`Carregado: ${r} sucesso(s), ${f} falha(s).`); if (f > 0) exibirNotificacao(`${f} registro(s) corrompido(s) ignorado(s).`, 'aviso', 8e3); return r > 0 || f === 0; } catch (e) { console.error("ERRO CRÍTICO parse LS:", e); console.error("Dados:", dS.substring(0, 500) + '...'); exibirNotificacao("Erro grave ler dados. Resetando.", 'erro', 1e4); try { localStorage.removeItem(GARAGE_STORAGE_KEY); console.log("Chave LS removida."); } catch (remE) { console.error("Erro remover chave:", remE); } veiculos = {}; return false; } }

// --- Renderização Dinâmica da Garagem (Confirmando botão remover) ---
function gerarHTMLVeiculo(veiculo) {
    if (!veiculo || !veiculo.id) { console.error("Gerar HTML: veículo inválido:", veiculo); return ''; }
    const id = veiculo.id, eB = veiculo instanceof Bicicleta, eCa = veiculo instanceof Caminhao, eCr = veiculo instanceof Carro, eCE = veiculo instanceof CarroEsportivo;
    let imgN = veiculo.tipoVeiculo.toLowerCase(), imgE = '.jpg';
    if (veiculo.tipoVeiculo === 'Moto') imgE = '.webp'; if (veiculo.tipoVeiculo === 'CarroEsportivo') imgN = 'carroesportivo';
    const imgS = `img/${imgN}${imgE}`, idB = `${id}_`;

    // A linha do botão remover está aqui e deve funcionar:
    return `
        <div id="${id}" class="veiculo-container" data-tipo="${veiculo.tipoVeiculo}">
            <button class="remover-veiculo-btn" data-action="remover" data-id="${id}" title="Remover ${veiculo.modelo}">×</button>
            <h2>${veiculo.tipoVeiculo.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <img id="${idB}imagem" src="${imgS}" alt="Imagem ${veiculo.modelo}" class="veiculo-imagem" onerror="this.src='img/placeholder.png'; console.warn('Img não encontrada: ${imgS}')">
            <p>Modelo: <span id="${idB}modelo">${veiculo.modelo}</span></p>
            <p>Cor: <span id="${idB}cor">${veiculo.cor}</span></p>
            ${!eB ? `<p>Estado: <span id="${idB}estado" style="color:${veiculo.ligado ? 'green':'red'}; font-weight:bold;">${veiculo.ligado ? 'Ligado':'Desligado'}</span></p>` : ''}
            <p>Velocidade: <span id="${idB}velocidade">${veiculo.velocidade.toFixed(eCa ? 1 : 0)}</span> km/h</p>
            ${eCE ? `<p>Turbo: <span id="${idB}turbo" style="color:${veiculo.turboAtivado ? 'orange':'grey'}; font-weight:bold;">${veiculo.turboAtivado ? 'Ativado':'Desativado'}</span></p>` : ''}
            ${eCa ? `<p>Capacidade: <span id="${idB}capacidade-carga">${veiculo.capacidadeCarga.toFixed(0)}</span> kg</p>` : ''}
            ${eCa ? `<p>Carga Atual: <span id="${idB}carga-atual">${veiculo.cargaAtual.toFixed(0)}</span> kg</p>` : ''}
            <div class="barra-progresso-container"><div id="${idB}barra-progresso" class="barra-progresso" style="width: 0%;"></div></div>
            <div id="${idB}controles" class="controles-veiculo">
                ${!eB ? `<button data-action="ligar" data-id="${id}">Ligar</button>`:''} ${!eB ? `<button data-action="desligar" data-id="${id}">Desligar</button>`:''}
                <button data-action="acelerar" data-id="${id}">Acelerar</button> <button data-action="frear" data-id="${id}">Frear</button>
                ${eCa ? `<input type="number" id="${idB}quantidade-carga" data-input="carga" data-id="${id}" placeholder="Qtd (kg)" min="0" style="width:75px; padding:7px;">`:''}
                ${eCa ? `<button data-action="carregar" data-id="${id}">Carregar</button>`:''} ${eCa ? `<button data-action="descarregar" data-id="${id}">Descarregar</button>`:''}
                ${eCE ? `<button data-action="ativarTurbo" data-id="${id}">Ativar Turbo</button>`:''} ${eCE ? `<button data-action="desativarTurbo" data-id="${id}">Desativar Turbo</button>`:''}
                <button data-action="mudarCor" data-id="${id}">Mudar Cor</button>
                ${eCr ? `<button data-action="animar" data-id="${id}">Animar</button>`:''}
                ${!eB ? `<button class="detalhes-veiculo-btn" data-action="detalhes" data-id="${id}">Detalhes / Manutenção</button>`:''}
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
                    v.atualizarCardCompletoNaTela(); // Atualiza estado visual
                    v.adicionarBotaoBuzina();       // Adiciona buzina se aplicável
                } catch (e) { console.error(`Erro renderizar ${id}:`, e, v); garagemContainer.insertAdjacentHTML('beforeend', `<div class="veiculo-container error-card">Erro renderizar ID: ${id}</div>`); }
            } else console.warn(`ID ${id} inválido em 'veiculos'.`);
        });
        console.log("Renderização garagem concluída.");
    }
}

// --- Lógica Adição Veículo (Sem alterações) ---
function toggleFormAddVeiculo(show = true) { if(show){ addVeiculoFormContainer.style.display = 'block'; btnMostrarFormAdd.textContent = 'Cancelar Adição'; formAddVeiculo.reset(); atualizarCamposOpcionaisFormAdd(); addTipoSelect.focus(); } else { addVeiculoFormContainer.style.display = 'none'; btnMostrarFormAdd.textContent = 'Adicionar Novo Veículo +'; } }
function atualizarCamposOpcionaisFormAdd() { const t = addTipoSelect.value; campoCapacidadeCarga.classList.remove('visivel'); addCapacidadeCargaInput.required = false; if (t === 'Caminhao') { campoCapacidadeCarga.classList.add('visivel'); addCapacidadeCargaInput.required = true; } else addCapacidadeCargaInput.value = ''; }
function handleAddVeiculoSubmit(e) { e.preventDefault(); const t = addTipoSelect.value, m = addModeloInput.value.trim(), c = addCorInput.value.trim(); if (!t || !m || !c) { exibirNotificacao("Preencha Tipo, Modelo e Cor.", 'erro'); if(!t) addTipoSelect.focus(); else if(!m) addModeloInput.focus(); else addCorInput.focus(); return; } const id = `${t.toLowerCase()}_${Date.now()}`; let nV = null; try { switch (t) { case 'Carro': nV = new Carro(m, c, id); break; case 'CarroEsportivo': nV = new CarroEsportivo(m, c, id); break; case 'Caminhao': const capS = addCapacidadeCargaInput.value, capN = parseFloat(capS); if (capS === '' || isNaN(capN) || capN < 0) { exibirNotificacao("Capacidade inválida.", 'erro'); addCapacidadeCargaInput.focus(); return; } nV = new Caminhao(m, c, id, capN); break; case 'Moto': nV = new Moto(m, c, id); break; case 'Bicicleta': nV = new Bicicleta(m, c, id); break; default: exibirNotificacao("Tipo inválido.", 'erro'); return; } veiculos[id] = nV; salvarGaragemNoLocalStorage(); renderizarGaragem(); toggleFormAddVeiculo(false); exibirNotificacao(`${t.replace(/([A-Z])/g,' $1').trim()} ${m} adicionado!`, 'sucesso'); tocarSom(sons.adicionar); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (err) { console.error("Erro criar/add veic:", err); exibirNotificacao(`Erro add: ${err.message}`, 'erro'); } }

// --- Lógica Remoção Veículo (Com log extra no listener) ---
function removerVeiculo(idRem) {
    if (!idRem || !veiculos[idRem]) { console.error(`Remover: ID inválido/não existe: ${idRem}`); exibirNotificacao("Erro: Veículo não encontrado.", 'erro'); return; }
    const v = veiculos[idRem];
    if (confirm(`Remover ${v.tipoVeiculo} "${v.modelo}" (ID: ${idRem})?`)) {
        console.log(`Removendo ${idRem}...`);
        try {
            if (veiculoSelecionadoId === idRem) fecharDetalhes(); // Fecha modal primeiro
            delete veiculos[idRem];
            salvarGaragemNoLocalStorage();
            const el = document.getElementById(idRem);
            if (el) { el.remove(); console.log(`Elem ${idRem} removido DOM.`); }
            else { console.warn(`Elem ${idRem} não achado DOM. Re-renderizando.`); renderizarGaragem(); }
            if (Object.keys(veiculos).length === 0) garagemVaziaMsg.style.display = 'block';
            exibirNotificacao(`${v.tipoVeiculo} ${v.modelo} removido.`, 'sucesso');
            console.log(`Veículo ${idRem} removido.`);
        } catch (e) { console.error(`Erro remover ${idRem}:`, e); exibirNotificacao(`Erro remover: ${e.message}`, 'erro'); renderizarGaragem(); }
    } else console.log(`Remoção ${idRem} cancelada.`);
}

// --- Lógica Detalhes/Agendamento Modal (Sem alterações) ---
function exibirInformacoesNaTela(vId) { if (!vId || !veiculos[vId]) { console.error(`Detalhes: ID inválido/não existe: ${vId}`); exibirNotificacao("Erro carregar detalhes.", "erro"); fecharDetalhes(); return; } const v = veiculos[vId]; veiculoSelecionadoId = vId; console.log(`Exibindo detalhes: ${v.modelo} (${vId})`); informacoesVeiculoDiv.innerHTML = ''; const tit = document.createElement("h3"); tit.textContent = `${v.tipoVeiculo.replace(/([A-Z])/g,' $1').trim()} - ${v.modelo}`; informacoesVeiculoDiv.appendChild(tit); const img = document.createElement("img"); let iN=v.tipoVeiculo.toLowerCase(), iE='.jpg'; if(v.tipoVeiculo==='Moto')iE='.webp'; if(v.tipoVeiculo==='CarroEsportivo')iN='carroesportivo'; img.src=`img/${iN}${iE}`; img.alt=`Img ${tit.textContent}`; img.className='detalhes-imagem'; img.onerror=()=>{img.src='img/placeholder.png'; console.warn(`Img não encontrada: img/${iN}${iE}`);}; informacoesVeiculoDiv.appendChild(img); const infoD = document.createElement("div"); infoD.className = 'detalhes-info-basica'; infoD.innerHTML = v.exibirInformacoesDetalhes(); informacoesVeiculoDiv.appendChild(infoD); if (!(v instanceof Bicicleta)) { const histD = document.createElement("div"); histD.className='detalhes-historico'; histD.innerHTML = `<h4>Histórico</h4><pre>${v.getHistoricoManutencaoFormatado()}</pre>`; informacoesVeiculoDiv.appendChild(histD); agendamentosFuturosContainer.style.display = 'block'; agendamentosFuturosConteudo.textContent = v.getAgendamentosFuturosFormatado(); agendamentoFormContainer.style.display = 'block'; limparFormularioAgendamento(); } else { agendamentoFormContainer.style.display = 'none'; agendamentosFuturosContainer.style.display = 'none'; const pSM = document.createElement("p"); pSM.textContent = "Bikes não têm histórico/agendamento."; pSM.className='detalhes-sem-manutencao'; informacoesVeiculoDiv.appendChild(pSM); } detalhesContainer.style.display = 'block'; document.body.classList.add('modal-aberto'); btnFecharDetalhes.focus(); detalhesContainer.scrollTop = 0; }
function fecharDetalhes() { detalhesContainer.style.display = 'none'; document.body.classList.remove('modal-aberto'); veiculoSelecionadoId = null; /* console.log("Modal fechado."); */ }
function limparFormularioAgendamento() { if (formAgendamento) formAgendamento.reset(); }
function handleAgendamentoSubmit(e) { e.preventDefault(); if (!veiculoSelecionadoId || !veiculos[veiculoSelecionadoId] || veiculos[veiculoSelecionadoId] instanceof Bicicleta) { exibirNotificacao("Selecione veículo motorizado.", 'erro'); return; } const v = veiculos[veiculoSelecionadoId]; const dI = document.getElementById('agenda-data'), tI = document.getElementById('agenda-tipo'), cI = document.getElementById('agenda-custo'), descI = document.getElementById('agenda-descricao'); if (!dI.value || !tI.value.trim() || cI.value === '') { exibirNotificacao("Preencha Data, Tipo e Custo.", 'erro'); return; } const cst = parseFloat(cI.value); if (isNaN(cst) || cst < 0) { exibirNotificacao("Custo inválido.", 'erro'); cI.focus(); return; } try { const nManut = new Manutencao(dI.value, tI.value, cst, descI.value); if (v.adicionarManutencao(nManut)) limparFormularioAgendamento(); } catch (err) { console.error("Erro criar/add manut:", err); exibirNotificacao(`Erro agendar: ${err.message}`, 'erro'); } }

// --- Lembretes Agendamento (Sem alterações) ---
function verificarAgendamentosProximos() { const hoje = new Date(); hoje.setHours(0,0,0,0); const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1); let lembretes = 0; Object.values(veiculos).forEach(v => { if (v && !(v instanceof Bicicleta) && v.historicoManutencao.length > 0) { v.historicoManutencao.forEach(m => { const dM = m.getDataObjeto(); if (dM) { const dMSH = new Date(dM.getFullYear(), dM.getMonth(), dM.getDate()); let msg = '', tipo = 'aviso'; if (dMSH.getTime() === hoje.getTime()) { msg = `HOJE: ${m.tipo} - ${v.modelo}`; tipo = 'erro'; } else if (dMSH.getTime() === amanha.getTime()) msg = `AMANHÃ: ${m.tipo} - ${v.modelo}`; if (msg) { lembretes++; setTimeout(() => exibirNotificacao(msg, tipo, 15000 + lembretes * 1000), lembretes * 300); } } }); } }); if(lembretes === 0) console.log("Nenhum agendamento hoje/amanhã."); else console.log(`${lembretes} lembrete(s) exibido(s).`); }

// --- Configuração dos Event Listeners (Com log extra no case 'remover') ---
function setupEventListeners() {
    console.log("Configurando event listeners...");
    btnMostrarFormAdd?.addEventListener('click', () => { toggleFormAddVeiculo(addVeiculoFormContainer.style.display !== 'block'); });
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

            // Log específico para a ação de remover
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
                        if (veiculo instanceof Caminhao) { const inp = document.getElementById(`${veiculoId}_quantidade-carga`); if(inp) { veiculo.carregar(inp.value); inp.value=''; } else console.warn(`Input carga ${veiculoId} não achado.`); } break;
                    case 'descarregar':
                         if (veiculo instanceof Caminhao) { const inp = document.getElementById(`${veiculoId}_quantidade-carga`); if(inp) { veiculo.descarregar(inp.value); inp.value=''; } else console.warn(`Input carga ${veiculoId} não achado.`); } break;
                     case 'animar':
                         if (veiculo instanceof Carro) { const card = document.getElementById(veiculoId), btn = targetButton; if (card && btn) { const isActive = card.classList.toggle("mover-animacao"); btn.textContent = isActive ? "Parar Animação" : "Animar"; } } break;
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

// --- Ponto de Entrada Principal (Com verificação extra do modal) ---
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
        console.log("[INIT] Verificando agendamentos...");
        verificarAgendamentosProximos();

        console.log("=============================================");
        console.log("[INIT] Garagem Inteligente inicializada!");
        console.log("=============================================");
        exibirNotificacao("Garagem pronta!", "sucesso", 2500);

    } catch (initError) {
        console.error("!!!!!!!!!!!!!!!! ERRO CRÍTICO INICIALIZAÇÃO !!!!!!!!!!!!!!!!", initError);
        const errorDiv = document.createElement('div'); errorDiv.style.cssText = 'background:red; color:white; padding:20px; text-align:center; font-weight:bold; position:fixed; top:0; left:0; width:100%; z-index:9999;'; errorDiv.textContent = `ERRO FATAL: ${initError.message}. Verifique console (F12) e limpe dados do site.`; document.body.prepend(errorDiv);
    }

    // --- Listeners Globais de Erro ---
    window.addEventListener('error', (e) => { console.error('** Erro Global:', e.error, e.message, '@', e.filename, ':', e.lineno); });
    window.addEventListener('unhandledrejection', (e) => { console.error('** Promise Rejeitada:', e.reason); });
});
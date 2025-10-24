/**
 * @file script.js
 * @description Lógica principal da Garagem Inteligente com Autenticação.
 * @author Arthur
 */

// ===================================================================================
// Bloco de Configuração
// ===================================================================================

const RENDER_BACKEND_URL = 'https://carroanimado.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:3001';

const backendUrl = LOCAL_BACKEND_URL; 
// const backendUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
//     ? LOCAL_BACKEND_URL
//     : RENDER_BACKEND_URL;

console.log(`[CONFIG] Frontend conectando ao backend em: ${backendUrl}`);

// ===================================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mapeia todos os elementos do DOM para um objeto central.
    // Fazemos isso aqui para garantir que todos os elementos HTML já existem.
    const elements = {
        notificacoesContainer: document.getElementById('notificacoes'),
        garagemContainer: document.getElementById('garagem-container'),
        btnMostrarFormAdd: document.getElementById('mostrar-form-add'),
        addVeiculoFormContainer: document.getElementById('add-veiculo-form-container'),
        formAddVeiculo: document.getElementById('form-add-veiculo'),
        btnCancelarAdd: document.getElementById('cancelar-add-veiculo'),
        detalhesContainer: document.getElementById('detalhes-e-agendamento'),
        informacoesVeiculoDiv: document.getElementById("informacoesVeiculo"),
        btnFecharDetalhes: document.getElementById('fechar-detalhes'),
        formAddManutencao: document.getElementById('form-add-manutencao'),
        authContainer: document.getElementById('auth-container'),
        garageMainContent: document.getElementById('garage-main-content'),
        loginContainer: document.getElementById('login-container'),
        registerContainer: document.getElementById('register-container'),
        formLogin: document.getElementById('form-login'),
        formRegister: document.getElementById('form-register'),
        showRegisterLink: document.getElementById('show-register'),
        showLoginLink: document.getElementById('show-login'),
        logoutButton: document.getElementById('logout-button')
    };

    // 2. Adiciona todos os "ouvidos" (event listeners) aos elementos.
    setupEventListeners(elements);

    // 3. Verifica o estado de autenticação para decidir o que mostrar na tela.
    checkAuthState(elements);
});

// ===================================================================================
// Funções de Ação e Eventos
// ===================================================================================
function setupEventListeners(elements) {
    console.log("[Setup] Iniciando a conexão de eventos...");

    // Listeners de Autenticação
    if (elements.formLogin) {
        console.log("[Setup] Conectando evento ao formulário de LOGIN.");
        elements.formLogin.addEventListener('submit', (event) => handleLogin(event, elements));
    } else {
        console.error("[Setup] ERRO: Formulário 'form-login' não encontrado.");
    }

    if (elements.formRegister) {
        console.log("[Setup] Conectando evento ao formulário de REGISTRO.");
        elements.formRegister.addEventListener('submit', (event) => handleRegister(event, elements));
    } else {
        console.error("[Setup] ERRO: Formulário 'form-register' não encontrado.");
    }
    
    elements.logoutButton?.addEventListener('click', handleLogout);
    elements.showRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        elements.loginContainer.style.display = 'none';
        elements.registerContainer.style.display = 'block';
    });
    elements.showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        elements.loginContainer.style.display = 'block';
        elements.registerContainer.style.display = 'none';
    });

    // Listeners da Garagem
    elements.btnMostrarFormAdd?.addEventListener('click', () => toggleFormAddVeiculo(elements, true));
    elements.btnCancelarAdd?.addEventListener('click', () => toggleFormAddVeiculo(elements, false));
    
    // Verificação específica para o formulário de adicionar veículo
    if (elements.formAddVeiculo) {
        console.log("[Setup] Conectando evento ao formulário de ADICIONAR VEÍCULO.");
        elements.formAddVeiculo.addEventListener('submit', (event) => handleAddVeiculoSubmit(event, elements));
    } else {
        console.error("[Setup] ERRO CRÍTICO: Formulário 'form-add-veiculo' não foi encontrado.");
    }
    
    elements.formAddManutencao?.addEventListener('submit', (event) => adicionarManutencao(event, elements));
    elements.btnFecharDetalhes?.addEventListener('click', () => fecharDetalhes(elements));

    // Delegação de eventos para botões dentro da garagem
    elements.garagemContainer?.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const { action, id } = target.dataset;
        if (action === 'excluir') handleExcluirVeiculo(id, elements);
        if (action === 'editar') handleEditarVeiculo(id, elements);
        if (action === 'detalhes') handleMostrarDetalhes(id, elements); 
    });

    console.log("[Setup] Conexão de eventos concluída.");
}

// ===================================================================================
// Funções de Autenticação e Controle de Estado
// ===================================================================================

function checkAuthState(elements) {
    const token = localStorage.getItem('token');
    if (token) {
        elements.authContainer.style.display = 'none';
        elements.garageMainContent.style.display = 'block';
        buscarErenderizarVeiculos(elements);
    } else {
        elements.authContainer.style.display = 'block';
        elements.garageMainContent.style.display = 'none';
    }
}

async function handleRegister(event, elements) {
    event.preventDefault();
     console.log("Função handleRegister foi chamada!"); 
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
     console.log(`Tentando registrar com e-mail: ${email}`);
    try {
        const response = await fetch(`${backendUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Falha no registro.');
        exibirNotificacao('Registro bem-sucedido! Agora você pode fazer o login.', 'sucesso');
        elements.loginContainer.style.display = 'block';
        elements.registerContainer.style.display = 'none';
    } catch (error) {
        exibirNotificacao(error.message, 'erro');
    }
}

async function handleLogin(event, elements) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Falha no login.');
        localStorage.setItem('token', data.token);
        exibirNotificacao('Login bem-sucedido!', 'sucesso');
        checkAuthState(elements);
    } catch (error) {
        exibirNotificacao(error.message, 'erro');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.reload();
}

// ===================================================================================
// Funções da Garagem
// ===================================================================================

async function buscarErenderizarVeiculos(elements) {
    const { garagemContainer } = elements;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) return handleLogout();
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
    // Escolhe a imagem com base no tipo
    const imagemSrc = `img/${veiculo.tipo.toLowerCase()}.jpg`;

    // Gera os botões específicos para cada tipo
    let controlesExtras = '';
    if (veiculo.tipo === 'CarroEsportivo') {
        controlesExtras = `<button>Ativar Turbo</button>`; // Adicionaremos a lógica depois
    } else if (veiculo.tipo === 'Bicicleta') {
        controlesExtras = `<button>Pedalar</button>`; // Apenas um exemplo
    }
    // Carros e Motos não têm botões extras por enquanto

    return `
        <div id="${veiculo._id}" class="veiculo-container" data-tipo="${veiculo.tipo}">
            <button class="remover-veiculo-btn" data-action="excluir" data-id="${veiculo._id}" title="Excluir ${veiculo.modelo}">×</button>
            <h2>${veiculo.marca} ${veiculo.modelo}</h2>
            
            <!-- Imagem dinâmica -->
            <img src="${imagemSrc}" alt="Imagem ${veiculo.modelo}" class="veiculo-imagem" onerror="this.src='img/carro.jpg';">
            
            <p><strong>Tipo:</strong> ${veiculo.tipo}</p>
            <p><strong>Placa:</strong> ${veiculo.placa}</p>
            <p><strong>Ano:</strong> ${veiculo.ano}</p>
            <p><strong>Cor:</strong> <span class="veiculo-cor">${veiculo.cor}</span></p>

            <div class="controles-veiculo">
                 ${controlesExtras}
                 <button data-action="editar" data-id="${veiculo._id}">Editar</button>
                 <button data-action="detalhes" data-id="${veiculo._id}">Detalhes</button>
            </div>
        </div>
    `;
}
function toggleFormAddVeiculo(elements, show) {
    const { addVeiculoFormContainer, btnMostrarFormAdd, formAddVeiculo } = elements;
    if (!addVeiculoFormContainer || !btnMostrarFormAdd) return;
    addVeiculoFormContainer.style.display = show ? 'block' : 'none';
    btnMostrarFormAdd.textContent = show ? 'Cancelar Adição' : 'Adicionar Novo Veículo +';
    if (show) formAddVeiculo.reset();
}

// SUBSTITUA A FUNÇÃO ANTIGA POR ESTA
async function handleAddVeiculoSubmit(event, elements) {
    event.preventDefault();
    
    console.log("-> A função handleAddVeiculoSubmit FOI CHAMADA!");

    const token = localStorage.getItem('token');
    if (!token) {
        console.error("-> Tentativa de adicionar veículo sem token. Abortando.");
        exibirNotificacao("Você precisa estar logado para adicionar um veículo.", "erro");
        return;
    }

    const veiculoParaSalvar = {
        tipo: document.getElementById('add-tipo').value,
        placa: document.getElementById('add-placa').value.toUpperCase(),
        marca: document.getElementById('add-marca').value,
        modelo: document.getElementById('add-modelo').value,
        ano: parseInt(document.getElementById('add-ano').value),
        cor: document.getElementById('add-cor').value
    };

    if (!veiculoParaSalvar.tipo) {
        exibirNotificacao('Por favor, selecione um tipo de veículo.', 'erro');
        return;
    }

    console.log("-> Dados do veículo a serem enviados:", veiculoParaSalvar);

    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // LINHA CRÍTICA ADICIONADA: Enviando o token para o backend
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(veiculoParaSalvar)
        });

        console.log("Resposta do servidor recebida. Status:", response.status);
        const resultado = await response.json();
        console.log("Dados da resposta (JSON):", resultado);

        if (!response.ok) {
            throw new Error(resultado.error || 'Erro desconhecido do servidor.');
        }
        
        exibirNotificacao('Veículo adicionado com sucesso!', 'sucesso');
        toggleFormAddVeiculo(elements, false);
        await buscarErenderizarVeiculos(elements);

    } catch (error) {
        console.error("-> Erro no bloco CATCH do handleAddVeiculoSubmit:", error);
        exibirNotificacao(error.message, 'erro');
    }
}

async function handleExcluirVeiculo(id, elements) {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) return handleLogout();
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error || 'Falha ao excluir o veículo.');
        
        exibirNotificacao(resultado.message, 'sucesso');
        document.getElementById(id)?.remove();
    } catch (error) {
        console.error('Erro ao excluir veículo:', error);
        exibirNotificacao(error.message, 'erro');
    }
}

async function handleEditarVeiculo(id, elements) {
    const cardDoVeiculo = document.getElementById(id);
    if (!cardDoVeiculo) return;
    const corAtual = cardDoVeiculo.querySelector('.veiculo-cor').textContent;
    const novaCor = prompt('Digite a nova cor do veículo:', corAtual);
    if (!novaCor || novaCor === corAtual) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cor: novaCor })
        });
        
        if (response.status === 401) return handleLogout();
        const veiculoAtualizado = await response.json();
        if (!response.ok) throw new Error(veiculoAtualizado.error || 'Falha ao atualizar o veículo.');
        
        exibirNotificacao('Veículo atualizado com sucesso!', 'sucesso');
        cardDoVeiculo.querySelector('.veiculo-cor').textContent = veiculoAtualizado.cor;
    } catch (error) {
        console.error('Erro ao editar veículo:', error);
        exibirNotificacao(error.message, 'erro');
    }
}

// ===================================================================================
// Funções de Manutenção
// ===================================================================================

async function handleMostrarDetalhes(id, elements) {
    const { detalhesContainer, informacoesVeiculoDiv } = elements;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) return handleLogout();
        const veiculo = await response.json();
        if (!response.ok) throw new Error(veiculo.error || 'Não foi possível buscar os detalhes do veículo.');

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

        document.getElementById('manutencao-veiculo-id').value = id;
        await carregarManutencoes(id, elements);
        
        detalhesContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Erro ao mostrar detalhes:', error);
        exibirNotificacao(error.message, 'erro');
    }
}

async function carregarManutencoes(veiculoId, elements) {
    const listaManutencoes = document.getElementById('lista-manutencoes');
    if (!listaManutencoes) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    listaManutencoes.innerHTML = '<li>Carregando manutenções...</li>';
    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${veiculoId}/manutencoes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) return handleLogout();
        const manutenções = await response.json();
        if (!response.ok) throw new Error(manutenções.error || 'Falha ao carregar manutenções.');

        if (manutenções.length === 0) {
            listaManutencoes.innerHTML = '<li>Nenhuma manutenção registrada para este veículo.</li>';
        } else {
            listaManutencoes.innerHTML = manutenções.map(m => `
                <li>
                    <strong>${new Date(m.data).toLocaleDateString('pt-BR')}</strong> - 
                    ${m.descricaoServico} - R$ ${m.custo.toFixed(2)}
                    ${m.quilometragem ? `(${m.quilometragem} km)` : ''}
                </li>
            `).join('');
        }
    } catch (error) {
        console.error("Erro ao carregar manutenções:", error);
        listaManutencoes.innerHTML = `<li style="color: red;">${error.message}</li>`;
    }
}

async function adicionarManutencao(event, elements) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const veiculoId = document.getElementById('manutencao-veiculo-id').value;
    const { formAddManutencao } = elements;
    if (!veiculoId) {
        exibirNotificacao('Erro: ID do veículo não encontrado.', 'erro');
        return;
    }

    const dadosFormulario = {
        descricaoServico: document.getElementById('manutencao-descricao').value,
        custo: parseFloat(document.getElementById('manutencao-custo').value),
        quilometragem: document.getElementById('manutencao-km').value ? parseInt(document.getElementById('manutencao-km').value) : undefined
    };

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${veiculoId}/manutencoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosFormulario)
        });

        if (response.status === 401) return handleLogout();
        const novaManutencao = await response.json();
        if (!response.ok) throw new Error(novaManutencao.error || 'Falha ao registrar manutenção.');

        exibirNotificacao('Manutenção registrada com sucesso!', 'sucesso');
        formAddManutencao.reset();
        await carregarManutencoes(veiculoId, elements);
    } catch (error) {
        console.error("Erro ao adicionar manutenção:", error);
        exibirNotificacao(error.message, 'erro');
    }
}

function fecharDetalhes(elements) {
    const { detalhesContainer } = elements;
    if (!detalhesContainer) return;
    detalhesContainer.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ===================================================================================
// Funções Utilitárias (Notificação)
// ===================================================================================

function exibirNotificacao(message, type = 'info', duration = 5000) {
    const notificacoesContainer = document.getElementById('notificacoes');
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
let animacaoAtiva = false;

document.getElementById("animar").addEventListener("click", () => {
    const carroContainer = document.getElementById("carro-container");

    if (animacaoAtiva) {
        carroContainer.classList.remove("mover-carro");
        animacaoAtiva = false;
    } else {
        carroContainer.classList.add("mover-carro");
        animacaoAtiva = true;
    }
});

// Elementos de áudio
const somBuzina = document.getElementById("som-buzina");
const somAcelerar = document.getElementById("som-acelerar");
const somFrear = document.getElementById("som-frear");
const somLigar = document.getElementById("som-ligar");
const somDesligar = document.getElementById("som-desligar");

// Funções auxiliares
function tocarSom(elementoAudio) {
    elementoAudio.currentTime = 0;
    elementoAudio.play();
}

function atualizarBarraDeProgresso(elementoId, velocidade) {
    const barraProgresso = document.getElementById(elementoId);
    barraProgresso.style.width = `${velocidade}%`;
}

function atualizarEstadoNaTela(elementoId, ligado) {
    const estadoElement = document.getElementById(elementoId);
    estadoElement.textContent = ligado ? "Ligado" : "Desligado";
    estadoElement.style.color = ligado ? "green" : "red";
}

function exibirAlerta(mensagem) {
    alert(mensagem); // Ou atualizar um elemento HTML na tela
}

// Classe Veiculo
class Veiculo {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    ligar() {
        if (this.ligado) {
            exibirAlerta("O veículo já está ligado.");
            return;
        }
        this.ligado = true;
        console.log("Veículo ligado!");
        tocarSom(somLigar);
        this.atualizarEstadoNaTela();
    }

    desligar() {
        if (!this.ligado) {
            exibirAlerta("O veículo já está desligado.");
            return;
        }
        this.ligado = false;
        this.velocidade = 0;
        console.log("Veículo desligado!");
        tocarSom(somDesligar);
        this.atualizarEstadoNaTela();
        this.atualizarVelocidadeNaTela();
    }

    acelerar(incremento) {
        if (!this.ligado) {
            exibirAlerta("O carro precisa estar ligado para acelerar.");
            return;
        }
        if (this.velocidade >= 100) {
            exibirAlerta("O veículo já está na velocidade máxima.");
            return;
        }
        this.velocidade += incremento;
        console.log(`Acelerando! Velocidade atual: ${this.velocidade} km/h`);
        tocarSom(somAcelerar);
        this.atualizarVelocidadeNaTela();
    }

    frear(decremento) {
        if (!this.ligado) {
            exibirAlerta("O carro precisa estar ligado para frear.");
            return;
        }
        if (this.velocidade === 0) {
            exibirAlerta("O veículo já está parado.");
            return;
        }
        this.velocidade = Math.max(0, this.velocidade - decremento);
        console.log(`Freando! Velocidade atual: ${this.velocidade} km/h`);
        tocarSom(somFrear);
        this.atualizarVelocidadeNaTela();
    }

    mudarCor(novaCor) {
        this.cor = novaCor;
        console.log(`Cor do veículo mudada para ${this.cor}`);
        this.atualizarCorNaTela();
    }

    getVelocidade() {
        return this.velocidade;
    }

    exibirInformacoes() {
        return `Modelo: ${this.modelo}, Cor: ${this.cor}, Estado: ${this.ligado ? "Ligado" : "Desligado"}, Velocidade: ${this.velocidade} km/h`;
    }

    atualizarVelocidadeNaTela() {
        // Método a ser sobrescrito
    }

    atualizarEstadoNaTela() {
        // Método a ser sobrescrito
    }

    atualizarCorNaTela() {
        // Método a ser sobrescrito
    }
}

// Classe Carro
class Carro extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.adicionarBotaoBuzina("controles", () => tocarSom(somBuzina));
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade").textContent = this.velocidade;
        atualizarBarraDeProgresso("barra-progresso-carro", this.velocidade);
    }

    atualizarEstadoNaTela() {
        atualizarEstadoNaTela("estado", this.ligado);
    }

    atualizarCorNaTela() {
        document.getElementById("cor").textContent = this.cor;
    }

    adicionarBotaoBuzina(containerId, onClick) {
        const container = document.getElementById(containerId);
        const button = document.createElement("button");
        button.textContent = "Buzinar";
        button.addEventListener("click", onClick);
        container.appendChild(button);
    }
}

// Classe CarroEsportivo
class CarroEsportivo extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.adicionarBotaoBuzina("controles-esportivo", () => tocarSom(somBuzina));
        this.turboAtivado = false;
    }

    ativarTurbo() {
        if (!this.ligado) {
            exibirAlerta("Ligue o carro esportivo primeiro!");
            return;
        }
        this.turboAtivado = true;
        this.acelerar(50);
        document.getElementById("turbo").textContent = "Ativado";
        console.log("Turbo ativado!");
    }

    desativarTurbo() {
        this.turboAtivado = false;
        document.getElementById("turbo").textContent = "Desativado";
        console.log("Turbo desativado.");
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-esportivo").textContent = this.getVelocidade();
        atualizarBarraDeProgresso("barra-progresso-esportivo", this.velocidade);
    }

    atualizarEstadoNaTela() {
        atualizarEstadoNaTela("estado-esportivo", this.ligado);
    }

    atualizarCorNaTela() {
        document.getElementById("cor-esportivo").textContent = this.cor;
    }

    exibirInformacoes() {
        return `${super.exibirInformacoes()}, Turbo: ${this.turboAtivado ? "Ativado" : "Desativado"}`;
    }

    adicionarBotaoBuzina(containerId, onClick) {
        const container = document.getElementById(containerId);
        const button = document.createElement("button");
        button.textContent = "Buzinar";
        button.addEventListener("click", onClick);
        container.appendChild(button);
    }

    carregar() {
        exibirAlerta("Um carro esportivo não pode ser carregado.");
    }
}

// Classe Caminhao
class Caminhao extends Veiculo {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        this.adicionarBotaoBuzina("controles-caminhao", () => tocarSom(somBuzina));
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(quantidade) {
        if (quantidade <= 0) {
            exibirAlerta("A quantidade a carregar deve ser maior que zero.");
            return;
        }
        if (this.cargaAtual + quantidade > this.capacidadeCarga) {
            exibirAlerta("Carga excede a capacidade máxima do caminhão!");
            return;
        }
        this.cargaAtual += quantidade;
        document.getElementById("carga-atual").textContent = this.cargaAtual;
        console.log(`Caminhão carregado com ${quantidade} kg. Carga atual: ${this.cargaAtual} kg`);
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-caminhao").textContent = this.getVelocidade();
        atualizarBarraDeProgresso("barra-progresso-caminhao", this.velocidade);
    }

    atualizarEstadoNaTela() {
        atualizarEstadoNaTela("estado-caminhao", this.ligado);
    }

    atualizarCorNaTela() {
        document.getElementById("cor-caminhao").textContent = this.cor;
    }

    exibirInformacoes() {
        return `${super.exibirInformacoes()}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
    }

    adicionarBotaoBuzina(containerId, onClick) {
        const container = document.getElementById(containerId);
        const button = document.createElement("button");
        button.textContent = "Buzinar";
        button.addEventListener("click", onClick);
        container.appendChild(button);
    }

    ativarTurbo() {
        exibirAlerta("Caminhões não têm turbo.");
    }
}

// Classe Moto
class Moto extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.adicionarBotaoBuzina("controles-moto", () => tocarSom(somBuzina));
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-moto").textContent = this.velocidade;
        atualizarBarraDeProgresso("barra-progresso-moto", this.velocidade);
    }

    atualizarEstadoNaTela() {
        atualizarEstadoNaTela("estado-moto", this.ligado);
    }

    atualizarCorNaTela() {
        document.getElementById("cor-moto").textContent = this.cor;
    }

    adicionarBotaoBuzina(containerId, onClick) {
        const container = document.getElementById(containerId);
        const button = document.createElement("button");
        button.textContent = "Buzinar";
        button.addEventListener("click", onClick);
        container.appendChild(button);
    }
}

// Classe Bicicleta
class Bicicleta extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        // A bicicleta não tem buzina, nem som de ligar/desligar
    }

    ligar() {
        console.log("A bicicleta não pode ser ligada.");
    }

    desligar() {
        console.log("A bicicleta não pode ser desligada.");
    }

    acelerar(incremento) {
        if (this.velocidade >= 30) {
            exibirAlerta("A bicicleta já está na velocidade máxima.");
            return;
        }
        this.velocidade += incremento;
        console.log(`Pedalando! Velocidade atual: ${this.velocidade} km/h`);
        tocarSom(somAcelerar);
        this.atualizarVelocidadeNaTela();
    }

    frear(decremento) {
        if (this.velocidade === 0) {
            exibirAlerta("A bicicleta já está parada.");
            return;
        }
        this.velocidade = Math.max(0, this.velocidade - decremento);
        console.log(`Freando a bicicleta! Velocidade atual: ${this.velocidade} km/h`);
        tocarSom(somFrear);
        this.atualizarVelocidadeNaTela();
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-bicicleta").textContent = this.velocidade;
        atualizarBarraDeProgresso("barra-progresso-bicicleta", this.velocidade);
    }

    atualizarCorNaTela() {
        document.getElementById("cor-bicicleta").textContent = this.cor;
    }

    exibirInformacoes() {
        return `${super.exibirInformacoes()}`;
    }

    atualizarEstadoNaTela() {
        // Bicicletas não têm estado de "ligado/desligado"
    }
}

// Criar objetos
const meuCarro = new Carro("Sedan", "Prata");
const meuCarroEsportivo = new CarroEsportivo("Ferrari", "Vermelho");
const meuCaminhao = new Caminhao("Volvo", "Branco", 10000);
const minhaMoto = new Moto("CG Titan", "Preta");
const minhaBicicleta = new Bicicleta("Caloi", "Azul");

// Inicializar informações na tela
document.getElementById("modelo").textContent = meuCarro.modelo;
document.getElementById("cor").textContent = meuCarro.cor;
atualizarEstadoNaTela("estado", meuCarro.ligado);
document.getElementById("velocidade").textContent = meuCarro.velocidade;

document.getElementById("modelo-esportivo").textContent = meuCarroEsportivo.modelo;
document.getElementById("cor-esportivo").textContent = meuCarroEsportivo.cor;
atualizarEstadoNaTela("estado-esportivo", meuCarroEsportivo.ligado);
document.getElementById("velocidade-esportivo").textContent = meuCarroEsportivo.velocidade;

document.getElementById("modelo-caminhao").textContent = meuCaminhao.modelo;
document.getElementById("cor-caminhao").textContent = meuCaminhao.cor;
atualizarEstadoNaTela("estado-caminhao", meuCaminhao.ligado);
document.getElementById("velocidade-caminhao").textContent = meuCaminhao.velocidade;
document.getElementById("capacidade-carga").textContent = meuCaminhao.capacidadeCarga;

document.getElementById("modelo-moto").textContent = minhaMoto.modelo;
document.getElementById("cor-moto").textContent = minhaMoto.cor;
atualizarEstadoNaTela("estado-moto", minhaMoto.ligado);
document.getElementById("velocidade-moto").textContent = minhaMoto.velocidade;

document.getElementById("modelo-bicicleta").textContent = minhaBicicleta.modelo;
document.getElementById("cor-bicicleta").textContent = minhaBicicleta.cor;
document.getElementById("velocidade-bicicleta").textContent = minhaBicicleta.velocidade;

// Adicionar eventos aos botões do Carro
document.getElementById("ligar").addEventListener("click", () => {
    meuCarro.ligar();
});

document.getElementById("desligar").addEventListener("click", () => {
    meuCarro.desligar();
});

document.getElementById("acelerar").addEventListener("click", () => {
    meuCarro.acelerar(10);
});

document.getElementById("frear").addEventListener("click", () => {
    meuCarro.frear(5);
});

document.getElementById("mudarCor").addEventListener("click", () => {
    const novaCor = prompt("Digite a nova cor do carro:");
    if (novaCor) {
        meuCarro.mudarCor(novaCor);
    }
});

// Adicionar eventos aos botões do Carro Esportivo
document.getElementById("ligar-esportivo").addEventListener("click", () => {
    meuCarroEsportivo.ligar();
});

document.getElementById("desligar-esportivo").addEventListener("click", () => {
    meuCarroEsportivo.desligar();
});

document.getElementById("acelerar-esportivo").addEventListener("click", () => {
    meuCarroEsportivo.acelerar(10);
});

document.getElementById("frear-esportivo").addEventListener("click", () => {
    meuCarroEsportivo.frear(5);
});

document.getElementById("ativar-turbo").addEventListener("click", () => {
    meuCarroEsportivo.ativarTurbo();
});

document.getElementById("desativar-turbo").addEventListener("click", () => {
    meuCarroEsportivo.desativarTurbo();
});

document.getElementById("mudarCor-esportivo").addEventListener("click", () => {
    const novaCor = prompt("Digite a nova cor do carro esportivo:");
    if (novaCor) {
        meuCarroEsportivo.mudarCor(novaCor);
    }
});

// Adicionar eventos aos botões do Caminhão
document.getElementById("ligar-caminhao").addEventListener("click", () => {
    meuCaminhao.ligar();
});

document.getElementById("desligar-caminhao").addEventListener("click", () => {
    meuCaminhao.desligar();
});

document.getElementById("acelerar-caminhao").addEventListener("click", () => {
    meuCaminhao.acelerar(10);
});

document.getElementById("frear-caminhao").addEventListener("click", () => {
    meuCaminhao.frear(5);
});

document.getElementById("carregar-caminhao").addEventListener("click", () => {
    const quantidadeCarga = parseFloat(document.getElementById("quantidade-carga").value);
    if (!isNaN(quantidadeCarga)) {
        meuCaminhao.carregar(quantidadeCarga);
    } else {
        console.log("Por favor, insira uma quantidade válida para carregar.");
    }
});

document.getElementById("mudarCor-caminhao").addEventListener("click", () => {
    const novaCor = prompt("Digite a nova cor do caminhão:");
    if (novaCor) {
        meuCaminhao.mudarCor(novaCor);
    }
});

// Adicionar eventos aos botões da Moto
document.getElementById("ligar-moto").addEventListener("click", () => {
    minhaMoto.ligar();
});

document.getElementById("desligar").addEventListener("click", () => {
    minhaMoto.desligar();
});

document.getElementById("acelerar-moto").addEventListener("click", () => {
    minhaMoto.acelerar(10);
});

document.getElementById("frear-moto").addEventListener("click", () => {
    minhaMoto.frear(5);
});

document.getElementById("mudarCor").addEventListener("click", () => {
    const novaCor = prompt("Digite a nova cor da moto:");
    if (novaCor) {
        minhaMoto.mudarCor(novaCor);
    }
});

// Adicionar eventos aos botões da Bicicleta
document.getElementById("acelerar-bicicleta").addEventListener("click", () => {
    minhaBicicleta.acelerar(5);
});

document.getElementById("frear-bicicleta").addEventListener("click", () => {
    minhaBicicleta.frear(3);
});

document.getElementById("mudarCor-bicicleta").addEventListener("click", () => {
    const novaCor = prompt("Digite a nova cor da bicicleta:");
    if (novaCor) {
        minhaBicicleta.mudarCor(novaCor);
    }
});

// Nova funcionalidade para exibir informações

// Função para exibir as informações no elemento HTML
function exibirInformacoesNaTela(veiculo) {
    const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
    informacoesVeiculoDiv.innerHTML = ""; // Limpa informações anteriores

    // Cria um elemento de imagem
    const imagem = document.createElement("img");
    let imageName = '';

    // Lógica para determinar o nome da imagem com base no tipo de veículo
    if (veiculo.constructor.name === 'Moto') {
        imageName = 'moto.webp';
    } else if (veiculo.constructor.name === 'CarroEsportivo') {
        imageName = 'carroesportivo.jpg'; // Nome específico para o carro esportivo
    } else {
        imageName = `${veiculo.constructor.name.toLowerCase()}.jpg`;
    }

    imagem.src = `img/${imageName}`; // Ajusta o caminho da imagem
    imagem.alt = `Imagem do ${veiculo.constructor.name}`;
    imagem.style.maxWidth = "200px"; // Define um tamanho máximo para a imagem
    imagem.style.marginBottom = "10px"; // Adiciona um espaço abaixo da imagem

    // Adiciona a imagem ao div de informações
    informacoesVeiculoDiv.appendChild(imagem);

    // Cria um elemento de parágrafo para as informações
    const informacoesParagrafo = document.createElement("p");
    informacoesParagrafo.textContent = veiculo.exibirInformacoes();

    // Adiciona o parágrafo ao div de informações
    informacoesVeiculoDiv.appendChild(informacoesParagrafo);
}

// Eventos para os botões de seleção de veículo
document.getElementById("selecionarCarro").addEventListener("click", () => {
    exibirInformacoesNaTela(meuCarro);
});

document.getElementById("selecionarCarroEsportivo").addEventListener("click", () => {
    exibirInformacoesNaTela(meuCarroEsportivo);
});

document.getElementById("selecionarCaminhao").addEventListener("click", () => {
    exibirInformacoesNaTela(meuCaminhao);
});

document.getElementById("selecionarMoto").addEventListener("click", () => {
    exibirInformacoesNaTela(minhaMoto);
});

document.getElementById("selecionarBicicleta").addEventListener("click", () => {
    exibirInformacoesNaTela(minhaBicicleta);
});

// Inicializar informações na tela
document.getElementById("cor").textContent = meuCarro.cor;
document.getElementById("cor-esportivo").textContent = meuCarroEsportivo.cor;
document.getElementById("cor-caminhao").textContent = meuCaminhao.cor;
document.getElementById("cor-moto").textContent = minhaMoto.cor;
document.getElementById("cor-bicicleta").textContent = minhaBicicleta.cor;
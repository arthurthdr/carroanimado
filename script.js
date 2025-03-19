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

// Classe Veiculo
class Veiculo {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            console.log("Veículo ligado!");
        } else {
            console.log("O veículo já está ligado.");
        }
        this.atualizarEstadoNaTela();
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this.velocidade = 0;
            console.log("Veículo desligado!");
        } else {
            console.log("O veículo já está desligado.");
        }
        this.atualizarEstadoNaTela();
        this.atualizarVelocidadeNaTela(); // Resetar a velocidade ao desligar
    }

    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            console.log(`Acelerando! Velocidade atual: ${this.velocidade} km/h`);
        } else {
            console.log("O carro precisa estar ligado para acelerar.");
        }
        this.atualizarVelocidadeNaTela();
    }

    frear(decremento) {
        if (this.ligado) {
            this.velocidade = Math.max(0, this.velocidade - decremento);
            console.log(`Freando! Velocidade atual: ${this.velocidade} km/h`);
        } else {
            console.log("O carro precisa estar ligado para frear.");
        }
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

    // Novo método exibirInformacoes() na classe Veiculo
    exibirInformacoes() {
        return `Modelo: ${this.modelo}, Cor: ${this.cor}, Estado: ${this.ligado ? "Ligado" : "Desligado"}, Velocidade: ${this.velocidade} km/h`;
    }

    // Métodos para atualizar a interface (a serem sobrescritos nas subclasses)
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
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade").textContent = this.velocidade;
    }

    atualizarEstadoNaTela() {
        document.getElementById("estado").textContent = this.ligado ? "Ligado" : "Desligado";
    }

    atualizarCorNaTela() {
        document.getElementById("cor").textContent = this.cor;
    }
}

// Classe CarroEsportivo
class CarroEsportivo extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.turboAtivado = false;
    }

    ativarTurbo() {
        if (this.ligado) {
            this.turboAtivado = true;
            this.acelerar(50);
            document.getElementById("turbo").textContent = "Ativado";
            console.log("Turbo ativado!");
        } else {
            console.log("Ligue o carro esportivo primeiro!");
        }
    }

    desativarTurbo() {
        this.turboAtivado = false;
        document.getElementById("turbo").textContent = "Desativado";
        console.log("Turbo desativado.");
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-esportivo").textContent = this.getVelocidade(); // Usa getVelocidade
    }

    atualizarEstadoNaTela() {
        document.getElementById("estado-esportivo").textContent = this.ligado ? "Ligado" : "Desligado";
    }

    atualizarCorNaTela() {
        document.getElementById("cor-esportivo").textContent = this.cor;
    }

    // Sobrescrevendo exibirInformacoes() para CarroEsportivo
    exibirInformacoes() {
        return `${super.exibirInformacoes()}, Turbo: ${this.turboAtivado ? "Ativado" : "Desativado"}`;
    }
}

// Classe Caminhao
class Caminhao extends Veiculo {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(quantidade) {
        if (this.cargaAtual + quantidade <= this.capacidadeCarga) {
            this.cargaAtual += quantidade;
            document.getElementById("carga-atual").textContent = this.cargaAtual;
            console.log(`Caminhão carregado com ${quantidade} kg. Carga atual: ${this.cargaAtual} kg`);
        } else {
            console.log("Carga excede a capacidade máxima do caminhão!");
        }
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-caminhao").textContent = this.getVelocidade(); // Usa getVelocidade
    }

    atualizarEstadoNaTela() {
        document.getElementById("estado-caminhao").textContent = this.ligado ? "Ligado" : "Desligado";
    }

    atualizarCorNaTela() {
        document.getElementById("cor-caminhao").textContent = this.cor;
    }

    // Sobrescrevendo exibirInformacoes() para Caminhao
    exibirInformacoes() {
        return `${super.exibirInformacoes()}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
    }
}

// Classe Moto
class Moto extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-moto").textContent = this.velocidade;
    }

    atualizarEstadoNaTela() {
        document.getElementById("estado-moto").textContent = this.ligado ? "Ligado" : "Desligado";
    }

    atualizarCorNaTela() {
        document.getElementById("cor-moto").textContent = this.cor;
    }
}

// Classe Bicicleta
class Bicicleta extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.velocidade = 0; // Bicicleta começa com velocidade 0
        this.ligado = false; // Bicicleta não pode ser ligada/desligada
    }

     // A bicicleta não pode ser ligada/desligada
    ligar() {
        console.log("A bicicleta não pode ser ligada.");
    }

    desligar() {
        console.log("A bicicleta não pode ser desligada.");
    }

    acelerar(incremento) {
        this.velocidade += incremento;
        console.log(`Pedalando! Velocidade atual: ${this.velocidade} km/h`);
        this.atualizarVelocidadeNaTela();
    }

    frear(decremento) {
        this.velocidade = Math.max(0, this.velocidade - decremento);
        console.log(`Freando a bicicleta! Velocidade atual: ${this.velocidade} km/h`);
        this.atualizarVelocidadeNaTela();
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade-bicicleta").textContent = this.velocidade;
    }

    atualizarCorNaTela() {
        document.getElementById("cor-bicicleta").textContent = this.cor;
    }

    exibirInformacoes() {
        return `${super.exibirInformacoes()}`; // Informações básicas
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
document.getElementById("estado").textContent = meuCarro.ligado ? "Ligado" : "Desligado";
document.getElementById("velocidade").textContent = meuCarro.velocidade;

document.getElementById("modelo-esportivo").textContent = meuCarroEsportivo.modelo;
document.getElementById("cor-esportivo").textContent = meuCarroEsportivo.cor;
document.getElementById("estado-esportivo").textContent = meuCarroEsportivo.ligado ? "Ligado" : "Desligado";
document.getElementById("velocidade-esportivo").textContent = meuCarroEsportivo.velocidade;

document.getElementById("modelo-caminhao").textContent = meuCaminhao.modelo;
document.getElementById("cor-caminhao").textContent = meuCaminhao.cor;
document.getElementById("estado-caminhao").textContent = meuCaminhao.ligado ? "Ligado" : "Desligado";
document.getElementById("velocidade-caminhao").textContent = meuCaminhao.velocidade;
document.getElementById("capacidade-carga").textContent = meuCaminhao.capacidadeCarga;

document.getElementById("modelo-moto").textContent = minhaMoto.modelo;
document.getElementById("cor-moto").textContent = minhaMoto.cor;
document.getElementById("estado-moto").textContent = minhaMoto.ligado ? "Ligado" : "Desligado";
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

document.getElementById("desligar-moto").addEventListener("click", () => {
    minhaMoto.desligar();
});

document.getElementById("acelerar-moto").addEventListener("click", () => {
    minhaMoto.acelerar(10);
});

document.getElementById("frear-moto").addEventListener("click", () => {
    minhaMoto.frear(5);
});

document.getElementById("mudarCor-moto").addEventListener("click", () => {
    const novaCor = prompt("Digite a nova cor da moto:");
    if (novaCor) {
        minhaMoto.mudarCor(novaCor);
        document.getElementById("cor-moto").textContent = minhaMoto.cor;
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
         document.getElementById("cor-bicicleta").textContent = minhaBicicleta.cor;
    }
});

// Nova funcionalidade para exibir informações

// Função para exibir as informações no elemento HTML
function exibirInformacoesNaTela(informacoes) {
    document.getElementById("informacoesVeiculo").textContent = informacoes;
}

// Eventos para os botões de seleção de veículo
document.getElementById("selecionarCarro").addEventListener("click", () => {
    exibirInformacoesNaTela(meuCarro.exibirInformacoes());
});

document.getElementById("selecionarCarroEsportivo").addEventListener("click", () => {
    exibirInformacoesNaTela(meuCarroEsportivo.exibirInformacoes());
});

document.getElementById("selecionarCaminhao").addEventListener("click", () => {
    exibirInformacoesNaTela(meuCaminhao.exibirInformacoes());
});

document.getElementById("selecionarMoto").addEventListener("click", () => {
    exibirInformacoesNaTela(minhaMoto.exibirInformacoes());
});

document.getElementById("selecionarBicicleta").addEventListener("click", () => {
    exibirInformacoesNaTela(minhaBicicleta.exibirInformacoes());
});

// Inicializar cores na tela
document.getElementById("cor").textContent = meuCarro.cor;
document.getElementById("cor-esportivo").textContent = meuCarroEsportivo.cor;
document.getElementById("cor-caminhao").textContent = meuCaminhao.cor;
document.getElementById("cor-moto").textContent = minhaMoto.cor;
document.getElementById("cor-bicicleta").textContent = minhaBicicleta.cor;
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

    getVelocidade() {
      return this.velocidade;
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
}

// Criar objetos
const meuCarro = new Carro("Sedan", "Prata");
const meuCarroEsportivo = new CarroEsportivo("Ferrari", "Vermelho");
const meuCaminhao = new Caminhao("Volvo", "Branco", 10000);

// Inicializar informações na tela
document.getElementById("modelo").textContent = meuCarro.modelo;
document.getElementById("cor").textContent = meuCarro.cor;
document.getElementById("modelo-esportivo").textContent = meuCarroEsportivo.modelo;
document.getElementById("cor-esportivo").textContent = meuCarroEsportivo.cor;
document.getElementById("modelo-caminhao").textContent = meuCaminhao.modelo;
document.getElementById("cor-caminhao").textContent = meuCaminhao.cor;
document.getElementById("capacidade-carga").textContent = meuCaminhao.capacidadeCarga;

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
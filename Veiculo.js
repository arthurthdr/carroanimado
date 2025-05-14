/**
 * Classe base para representar um veículo.
 */
class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} m - O modelo do veículo.
     * @param {string} c - A cor do veículo.
     * @param {string} tipo - O tipo do veículo (ex: "Carro", "Moto").
     * @param {string} id - O ID único do veículo.
     */
    constructor(m, c, tipo, id) {
        if (!tipo) throw new Error("Tipo é obrigatório.");
        this.modelo = m;
        this.cor = c;
        this.tipoVeiculo = tipo;
        this.id = id;
        this.velocidade = 0;
        this.ligado = false;
        this.historicoManutencao = [];
    }

    /**
     * Retorna a velocidade máxima do veículo. (Método abstrato)
     * @returns {number} - A velocidade máxima do veículo.
     */
    getVelocidadeMaxima() {
        return 100;
    }

    /**
     * Liga o veículo.
     * @returns {void}
     */
    ligar() {
        if (this.ligado) return;
        this.ligado = true;
        this.atualizarEstadoNaTela();
        tocarSom(sons.ligar); // Tocar som ao ligar
        exibirNotificacao(`${this.tipoVeiculo} ${this.modelo} ligado(a).`, 'sucesso');
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Desliga o veículo.
     * @returns {void}
     */
    desligar() {
        if (!this.ligado) return;
        this.ligado = false;
        this.atualizarEstadoNaTela();
        tocarSom(sons.desligar); // Tocar som ao desligar
        exibirNotificacao(`${this.tipoVeiculo} ${this.modelo} desligado(a).`, 'aviso');
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Acelera o veículo.
     * @param {number} incremento - O valor a ser incrementado na velocidade.
     * @returns {void}
     */
    acelerar(incremento) {
        const inc = Math.abs(parseFloat(incremento) || 10);
        const max = this.getVelocidadeMaxima();
        if (this.velocidade + inc > max) {
            this.velocidade = max;
            exibirNotificacao(`${this.tipoVeiculo} ${this.modelo}: Velocidade máxima atingida!`, 'aviso');
        } else {
            this.velocidade += inc;
        }
        this.atualizarVelocidadeNaTela();
        tocarSom(sons.acelerar); // Tocar som ao acelerar
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Freia o veículo.
     * @param {number} decremento - O valor a ser decrementado da velocidade.
     * @returns {void}
     */
    frear(decremento) {
        const dec = Math.abs(parseFloat(decremento) || 10);
        if (this.velocidade - dec < 0) {
            this.velocidade = 0;
        } else {
            this.velocidade -= dec;
        }
        this.atualizarVelocidadeNaTela();
        tocarSom(sons.frear); // Tocar som ao frear
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Muda a cor do veículo.
     * @param {string} novaCor - A nova cor do veículo.
     * @returns {void}
     */
    mudarCor(novaCor) {
        if (!novaCor || typeof novaCor !== 'string' || novaCor.trim().length < 3) {
            exibirNotificacao("Cor inválida.", 'erro');
            return;
        }
        this.cor = novaCor.trim();
        this.atualizarCorNaTela();
        exibirNotificacao(`${this.tipoVeiculo} ${this.modelo}: Cor alterada para ${this.cor}.`, 'sucesso');
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Adiciona uma manutenção ao histórico do veículo.
     * @param {Manutencao} manutencao - A manutenção a ser adicionada.
     * @returns {boolean} - True se a manutenção foi adicionada com sucesso, false caso contrário.
     */
    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao) || !manutencao.validarDados()) {
            console.error("Manutenção inválida:", manutencao);
            exibirNotificacao("Dados da manutenção inválidos.", 'erro');
            return false;
        }
        this.historicoManutencao.push(manutencao);
        this.historicoManutencao.sort((a, b) => (a.getDataObjeto() || 0) - (b.getDataObjeto() || 0));
        this.atualizarHistoricoNaTela();
        return true;
    }

    /**
     * Formata o histórico de manutenção do veículo para exibição.
     * @returns {string} - O histórico de manutenção formatado.
     */
    getHistoricoManutencaoFormatado() {
        if (!Array.isArray(this.historicoManutencao) || this.historicoManutencao.length === 0) {
            return "Nenhuma manutenção registrada.";
        }
        return this.historicoManutencao.map(m => {
            const dataFormatada = m.getDataObjeto()?.toLocaleDateString('pt-BR') || 'Data Inválida';
            return `${dataFormatada} - ${m.tipo} (R$ ${m.custo.toFixed(2)}) - ${m.descricao || 'Sem descrição'}`;
        }).join('\n');
    }

    /**
     * Formata os agendamentos futuros do veículo para exibição.
     * @returns {string} - Os agendamentos futuros formatados.
     */
    getAgendamentosFuturosFormatado() {
        return this.getHistoricoManutencaoFormatado(); // Por enquanto, reaproveita o histórico
    }

    /**
     * Atualiza o estado do veículo exibido na tela.
     * @returns {void}
     */
    atualizarEstadoNaTela() {
        const el = this._findElement('estado');
        if (el) el.textContent = this.ligado ? 'Ligado' : 'Desligado';
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Atualiza a cor do veículo exibida na tela.
     * @returns {void}
     */
    atualizarCorNaTela() {
        const el = this._findElement('cor');
        if (el) el.textContent = this.cor;
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Atualiza a velocidade do veículo exibida na tela.
     * @returns {void}
     */
    atualizarVelocidadeNaTela() {
        const el = this._findElement('velocidade');
        if (el) el.textContent = this.velocidade.toFixed(0) + ' km/h';
        const elP = this._findElement('barra-progresso');
        if (elP) {
            const perc = (this.velocidade / this.getVelocidadeMaxima()) * 100;
            atualizarBarraDeProgresso(elP, perc);
        }
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Atualiza o histórico de manutenção exibido na tela.
     * @returns {void}
     */
    atualizarHistoricoNaTela() {
        // (Por implementar)
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Converte o veículo para um objeto JSON (para LocalStorage).
     * @returns {object} - Um objeto JSON representando o veículo.
     */
    toJSON() {
        return {
            modelo: this.modelo,
            cor: this.cor,
            tipoVeiculo: this.tipoVeiculo,
            id: this.id,
            velocidade: this.velocidade,
            ligado: this.ligado,
            historicoManutencao: this.historicoManutencao.map(m => m.toJSON())
        };
    }

    /**
     * Exibe as informações detalhadas do veículo.
     * @returns {string} - HTML formatado com as informações do veículo.
     */
    exibirInformacoesDetalhes() {
        const historicoHTML = this.getHistoricoManutencaoFormatado();
        return `
            <div class="detalhes-info-basica">
                <h3>${this.tipoVeiculo} ${this.modelo}</h3>
                <img src="img/${this.tipoVeiculo.toLowerCase()}.jpg" alt="Imagem ${this.modelo}" class="detalhes-imagem">
                <p><strong>Modelo:</strong> <span>${this.modelo}</span></p>
                <p><strong>Cor:</strong> <span id="${this.id}_cor">${this.cor}</span></p>
                <p><strong>Estado:</strong> <span id="${this.id}_estado">${this.ligado ? 'Ligado' : 'Desligado'}</span></p>
                <p><strong>Velocidade:</strong> <span id="${this.id}_velocidade">${this.velocidade.toFixed(0)} km/h</span></p>
            </div>
            <div class="detalhes-historico">
                <h4>Histórico de Manutenção</h4>
                <pre>${historicoHTML}</pre>
            </div>
            <div class="detalhes-agendamentos">
                <h4>Agendamentos Futuros</h4>
                <pre>${this.getAgendamentosFuturosFormatado()}</pre>
            </div>
        `;
    }

    /**
     * Encontra um elemento dentro do card do veículo.
     * @param {string} elemento - O ID do elemento a ser encontrado.
     * @returns {HTMLElement|null} - O elemento encontrado ou null se não encontrado.
     */
    _findElement(elemento) {
        return document.getElementById(`${this.id}_${elemento}`);
    }

    /**
     * Atualiza o card completo do veículo na tela.
     * @returns {void}
     */
    atualizarCardCompletoNaTela() {
        const card = document.getElementById(this.id);
        if (card) {
            card.outerHTML = gerarHTMLVeiculo(this);
        }
    }
}
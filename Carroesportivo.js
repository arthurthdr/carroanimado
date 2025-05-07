/**
 * Classe que representa um carro esportivo, herda de Veiculo.
 */
class CarroEsportivo extends Veiculo {
    /**
     * Cria uma instância de CarroEsportivo.
     * @param {string} m - O modelo do carro esportivo.
     * @param {string} c - A cor do carro esportivo.
     * @param {string} id - O ID único do carro esportivo.
     */
    constructor(m, c, id) {
        super(m, c, 'CarroEsportivo', id);
        this.turboAtivado = false;
    }

    /**
     * Retorna a velocidade máxima do carro esportivo, que varia se o turbo está ativado.
     * @returns {number} - A velocidade máxima do carro esportivo.
     */
    getVelocidadeMaxima() {
        return this.turboAtivado ? 250 : 200;
    }

    /**
     * Ativa o turbo do carro esportivo.
     * @returns {void}
     */
    ativarTurbo() {
        if (this.turboAtivado) return;
        this.turboAtivado = true;
        this.atualizarEstadoTurboNaTela();
        exibirNotificacao(`${this.tipoVeiculo} ${this.modelo}: TURBO ATIVADO!`, 'sucesso');
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Desativa o turbo do carro esportivo.
     * @returns {void}
     */
    desativarTurbo() {
        if (!this.turboAtivado) return;
        this.turboAtivado = false;
        this.atualizarEstadoTurboNaTela();
        exibirNotificacao(`${this.tipoVeiculo} ${this.modelo}: Turbo desativado.`, 'aviso');
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Atualiza o estado do turbo exibido na tela.
     * @returns {void}
     */
    atualizarEstadoTurboNaTela() {
        const el = this._findElement('turbo');
        if (el) el.textContent = this.turboAtivado ? 'Ativado' : 'Desativado';
    }

    /**
     * Atualiza as informações detalhadas visíveis do carro esportivo.
     * @returns {void}
     */
    atualizarDetalhesVisiveis() {
        this.atualizarEstadoTurboNaTela();
    }

    /**
     * Converte o carro esportivo para um objeto JSON (para LocalStorage).
     * @returns {object} - Um objeto JSON representando o carro esportivo.
     */
    toJSON() {
        const obj = super.toJSON();
        obj.turboAtivado = this.turboAtivado;
        return obj;
    }
}
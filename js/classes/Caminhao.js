/**
 * Classe que representa um caminhão, herda de Veiculo.
 */
class Caminhao extends Veiculo {
    /**
     * Cria uma instância de Caminhao.
     * @param {string} m - O modelo do caminhão.
     * @param {string} c - A cor do caminhão.
     * @param {string} id - O ID único do caminhão.
     * @param {number} cap - A capacidade de carga do caminhão.
     */
    constructor(m, c, id, cap) {
        super(m, c, 'Caminhao', id);
        this.capacidadeCarga = Math.max(0, parseFloat(cap) || 5000);
        this.cargaAtual = 0;
    }

    /**
     * Retorna a velocidade máxima do caminhão.
     * @returns {number} - A velocidade máxima do caminhão (120 km/h).
     */
    getVelocidadeMaxima() {
        return 120;
    }

    /**
     * Carrega o caminhão com uma determinada quantidade de carga.
     */
    carregar(qtd) {
        const quantidade = parseFloat(qtd);
        if (isNaN(quantidade) || quantidade <= 0) {
            exibirNotificacao("Quantidade de carga inválida.", 'erro');
            return;
        }
        if (this.cargaAtual + quantidade > this.capacidadeCarga) {
            exibirNotificacao("Carga excede a capacidade.", 'aviso');
            this.cargaAtual = this.capacidadeCarga;
        } else {
            this.cargaAtual += quantidade;
        }
        this.atualizarCargaNaTela();
        exibirNotificacao(`Caminhão carregado com ${quantidade} kg.`, 'sucesso');
    }

    /**
     * Descarrega o caminhão com uma determinada quantidade de carga.
     */
    descarregar(qtd) {
        const quantidade = parseFloat(qtd);
        if (isNaN(quantidade) || quantidade <= 0) {
            exibirNotificacao("Quantidade de descarga inválida.", 'erro');
            return;
        }
        if (this.cargaAtual - quantidade < 0) {
            exibirNotificacao("Descarga excede a carga atual.", 'aviso');
            this.cargaAtual = 0;
        } else {
            this.cargaAtual -= quantidade;
        }
        this.atualizarCargaNaTela();
        exibirNotificacao(`Caminhão descarregado com ${quantidade} kg.`, 'sucesso');
    }

    /**
     * Atualiza a carga exibida na tela.
     */
    atualizarCargaNaTela() {
        const el = this._findElement('carga-atual');
        if (el) el.textContent = this.cargaAtual.toFixed(0) + ' kg';
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Atualiza as informações detalhadas visíveis do caminhão.
     */
    atualizarDetalhesVisiveis() {
        this.atualizarCargaNaTela();
    }

    /**
     * Converte o caminhão para um objeto JSON (para LocalStorage).
     */
    toJSON() {
        const obj = super.toJSON();
        obj.capacidadeCarga = this.capacidadeCarga;
        obj.cargaAtual = this.cargaAtual;
        return obj;
    }
}
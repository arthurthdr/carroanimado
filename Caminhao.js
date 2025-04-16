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
     * @param {number} qtd - A quantidade de carga a ser adicionada.
     * @returns {void}
     */
    carregar(qtd) {
        // Implementação do carregamento do caminhão
    }

    /**
     * Descarrega o caminhão com uma determinada quantidade de carga.
     * @param {number} qtd - A quantidade de carga a ser removida.
     * @returns {void}
     */
    descarregar(qtd) {
       // Implementação do descarregamento do caminhão
    }

    /**
     * Atualiza a carga exibida na tela.
     * @returns {void}
     */
    atualizarCargaNaTela() {
        // Implementação da atualização da carga na tela
    }

    /**
     * Atualiza as informações detalhadas visíveis do caminhão.
     * @returns {void}
     */
    atualizarDetalhesVisiveis() {
        // Implementação da atualização dos detalhes visíveis
    }
}
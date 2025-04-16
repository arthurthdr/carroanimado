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
        // Implementação da ativação do turbo
    }

    /**
     * Desativa o turbo do carro esportivo.
     * @returns {void}
     */
    desativarTurbo() {
       // Implementação da desativação do turbo
    }

    /**
     * Atualiza o estado do turbo exibido na tela.
     * @returns {void}
     */
    atualizarEstadoTurboNaTela() {
        // Implementação da atualização do estado do turbo na tela
    }

    /**
     * Atualiza as informações detalhadas visíveis do carro esportivo.
     * @returns {void}
     */
    atualizarDetalhesVisiveis() {
        // Implementação da atualização dos detalhes visíveis
    }
}
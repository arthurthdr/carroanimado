/**
 * Classe que representa um carro, herda de Veiculo.
 */
class Carro extends Veiculo {
    /**
     * Cria uma instância de Carro.
     * @param {string} m - O modelo do carro.
     * @param {string} c - A cor do carro.
     * @param {string} id - O ID único do carro.
     */
    constructor(m, c, id) {
        super(m, c, 'Carro', id);
    }

    /**
     * Retorna a velocidade máxima do carro.
     * @returns {number} - A velocidade máxima do carro (180 km/h).
     */
    getVelocidadeMaxima() {
        return 180;
    }
}
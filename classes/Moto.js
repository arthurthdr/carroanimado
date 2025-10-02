/**
 * Classe que representa uma moto, herda de Veiculo.
 */
class Moto extends Veiculo {
    /**
     * Cria uma instância de Moto.
     * @param {string} m - O modelo da moto.
     * @param {string} c - A cor da moto.
     * @param {string} id - O ID único da moto.
     */
    constructor(m, c, id) {
        super(m, c, 'Moto', id);
    }

    /**
     * Retorna a velocidade máxima da moto.
     * @returns {number} - A velocidade máxima da moto (160 km/h).
     */
    getVelocidadeMaxima() {
        return 160;
    }
}
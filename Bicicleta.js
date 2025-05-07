/**
 * Classe que representa uma bicicleta, herda de Veiculo.
 */
class Bicicleta extends Veiculo {
    /**
     * Cria uma instância de Bicicleta.
     * @param {string} m - O modelo da bicicleta.
     * @param {string} c - A cor da bicicleta.
     * @param {string} id - O ID único da bicicleta.
     */
    constructor(m, c, id) {
        super(m, c, 'Bicicleta', id);
        this.ligado = false;
    }

    /**
     * Retorna a velocidade máxima da bicicleta.
     * @returns {number} - A velocidade máxima da bicicleta (35 km/h).
     */
    getVelocidadeMaxima() {
        return 35;
    }

    /**
     * Bikes não ligam.
     * @returns {void}
     */
    ligar() {
        // Implementação da ação de ligar a bicicleta
    }

    /**
     * Bikes não desligam.
     * @returns {void}
     */
    desligar() {
        // Implementação da ação de desligar a bicicleta
    }

    /**
     * Bikes não possuem manutenção.
     * @returns {void}
     */
    adicionarManutencao() {
        // Implementação da adição de manutenção para bicicleta
    }

    /**
     * Retorna uma mensagem indicando que bicicletas não possuem histórico de manutenção.
     * @returns {string} - A mensagem "N/A".
     */
    getHistoricoManutencaoFormatado() {
        return "N/A";
    }

    /**
     * Retorna uma mensagem indicando que bicicletas não possuem agendamentos futuros.
     * @returns {string} - A mensagem "N/A".
     */
    getAgendamentosFuturosFormatado() {
        return "N/A";
    }

    /**
     * Bicicletas não possuem buzina.
     * @returns {void}
     */
    adicionarBotaoBuzina() {
        // Implementação da adição do botão de buzina para bicicleta
    }
}
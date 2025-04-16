/**
 * Classe base para representar um veículo.
 */
class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     * @param {string} tipoVeiculo - O tipo do veículo (Carro, CarroEsportivo, Caminhao, Moto, Bicicleta).
     * @param {string} id - O ID único do veículo.
     * @throws {Error} - Lança um erro se o tipo ou o ID forem inválidos.
     */
    constructor(modelo, cor, tipoVeiculo, id) {
        if (!tipoVeiculo || !['Carro', 'CarroEsportivo', 'Caminhao', 'Moto', 'Bicicleta'].includes(tipoVeiculo)) throw new Error("Tipo inválido.");
        if (!id || typeof id !== 'string' || id.trim() === '') throw new Error("ID inválido.");

        this.modelo = modelo ? String(modelo).trim() : 'Desconhecido';
        this.cor = cor ? String(cor).trim() : 'Desconhecida';
        this.tipoVeiculo = tipoVeiculo;
        this.id = id;
        this.ligado = false;
        this.velocidade = 0;
        this.historicoManutencao = [];
    }

    /**
     * Encontra um elemento DOM específico do veículo.
     * @param {string} suf - O sufixo do ID do elemento.
     * @returns {HTMLElement|null} - O elemento DOM encontrado ou null se não encontrado.
     * @protected
     */
    _findElement(suf) {
        return document.getElementById(`${this.id}_${suf}`);
    }

    /**
     * Liga o veículo.
     * @returns {void}
     */
    ligar() {
        // Implementação específica para cada tipo de veículo
    }

    /**
     * Desliga o veículo.
     * @returns {void}
     */
    desligar() {
       // Implementação específica para cada tipo de veículo
    }

    /**
     * Acelera o veículo.
     * @param {number} incBase - O incremento base de velocidade.
     * @returns {void}
     */
    acelerar(incBase) {
        // Implementação específica para cada tipo de veículo
    }

    /**
     * Freia o veículo.
     * @param {number} dec - O decremento de velocidade.
     * @returns {void}
     */
    frear(dec) {
        // Implementação específica para cada tipo de veículo
    }

    /**
     * Muda a cor do veículo.
     * @param {string} nCor - A nova cor do veículo.
     * @returns {void}
     */
    mudarCor(nCor) {
       // Implementação específica para cada tipo de veículo
    }

    /**
     * Retorna a velocidade máxima do veículo.
     * @returns {number} - A velocidade máxima.
     */
    getVelocidadeMaxima() {
        return 100;
    }

    /**
     * Adiciona uma manutenção ao histórico do veículo.
     * @param {Manutencao} mObj - O objeto Manutencao a ser adicionado.
     * @returns {boolean} - True se a manutenção foi adicionada com sucesso, false caso contrário.
     */
    adicionarManutencao(mObj) {
       // Implementação específica para cada tipo de veículo
    }

    /**
     * Filtra e ordena as manutenções do veículo.
     * @param {Function} fData - Uma função de filtro para as datas.
     * @returns {Array<Manutencao>} - Um array de manutenções filtradas e ordenadas.
     * @protected
     */
    _filtrarEOrdenarManutencoes(fData) {
        // Implementação específica para cada tipo de veículo
    }

    /**
     * Retorna o histórico de manutenções formatado para exibição.
     * @returns {string} - Uma string formatada com o histórico de manutenções.
     */
    getHistoricoManutencaoFormatado() {
        return ""; // Implementação específica para cada tipo de veículo
    }

    /**
     * Retorna os agendamentos futuros formatados para exibição.
     * @returns {string} - Uma string formatada com os agendamentos futuros.
     */
    getAgendamentosFuturosFormatado() {
       return ""; // Implementação específica para cada tipo de veículo
    }

    /**
     * Atualiza a velocidade exibida na tela.
     * @returns {void}
     */
    atualizarVelocidadeNaTela() {
        // Implementação específica para cada tipo de veículo
    }

    /**
     * Atualiza o estado (ligado/desligado) exibido na tela.
     * @returns {void}
     */
    atualizarEstadoNaTela() {
        // Implementação específica para cada tipo de veículo
    }

    /**
     * Atualiza a cor exibida na tela.
     * @returns {void}
     */
    atualizarCorNaTela() {
       // Implementação específica para cada tipo de veículo
    }

    /**
     * Atualiza todas as informações do card do veículo na tela.
     * @returns {void}
     */
    atualizarCardCompletoNaTela() {
        // Implementação específica para cada tipo de veículo
    }

    /**
     * Adiciona o botão de buzina ao card do veículo.
     * @returns {void}
     */
    adicionarBotaoBuzina() {
       // Implementação específica para cada tipo de veículo
    }

    /**
     * Exibe as informações detalhadas do veículo no modal.
     * @returns {string} - Uma string formatada com as informações do veículo.
     */
    exibirInformacoesDetalhes() {
        return ""; // Implementação específica para cada tipo de veículo
    }

    /**
     * Converte o veículo para um objeto JSON.
     * @returns {object} - Um objeto JSON representando o veículo.
     */
    toJSON() {
        return {}; // Implementação específica para cada tipo de veículo
    }
}
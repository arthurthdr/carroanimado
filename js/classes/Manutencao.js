/**
 * Classe que representa uma manutenção de um veículo.
 */
class Manutencao {
    /**
     * Cria uma nova instância de Manutencao.
     * @param {string} data A data da manutenção (formato string).
     * @param {string} tipo O tipo de serviço realizado (ex: "Troca de óleo").
     * @param {number} custo O custo da manutenção.
     * @param {string} [descricao] Uma descrição opcional da manutenção.
     */
    constructor(data, tipo, custo, descricao) {
        this.data = data;
        this.tipo = tipo;
        this.custo = custo;
        this.descricao = descricao || '';
    }

    /**
     * Obtém a data da manutenção como um objeto Date.
     * @returns {Date|null} A data da manutenção ou null se a data for inválida.
     */
    getDataObjeto() {
        try {
            return new Date(this.data);
        } catch (e) {
            console.error("Erro ao converter data:", e);
            return null;
        }
    }

    /**
     * Valida os dados da manutenção.
     * @returns {boolean} True se os dados são válidos, false caso contrário.
     */
    validarDados() {
        const d = this.getDataObjeto();
        if (!d || isNaN(d.getTime())) {
            console.error("Data inválida:", this.data);
            return false;
        }
        if (typeof this.tipo !== 'string' || this.tipo.trim() === '') {
            console.error("Tipo inválido:", this.tipo);
            return false;
        }
        if (typeof this.custo !== 'number' || isNaN(this.custo) || this.custo <= 0) {
            console.error("Custo inválido:", this.custo);
            return false;
        }
        return true;
    }

    /**
     * Obtém a data da manutenção.
     * @returns {string} A data da manutenção.
     */
    get dataManutencao() {
        return this.data;
    }

    /**
     * Obtém o tipo de manutenção.
     * @returns {string} O tipo de manutenção.
     */
    get tipoManutencao() {
        return this.tipo;
    }

    /**
     * Obtém o custo da manutenção.
     * @returns {number} O custo da manutenção.
     */
    get custoManutencao() {
        return this.custo;
    }

    /**
     * Obtém a descrição da manutenção.
     * @returns {string} A descrição da manutenção.
     */
    get descricaoManutencao() {
        return this.descricao;
    }
}
/**
 * Classe que representa uma manutenção veicular.
 */
class Manutencao {
    /**
     * Cria uma instância de Manutencao.
     * @param {string} data - A data da manutenção (AAAA-MM-DD).
     * @param {string} tipo - O tipo de serviço realizado.
     * @param {number} custo - O custo da manutenção.
     * @param {string} [descricao=''] - Uma descrição opcional da manutenção.
     */
    constructor(data, tipo, custo, descricao = '') {
        this.data = data;
        this.tipo = tipo ? String(tipo).trim() : '';
        this.custo = parseFloat(custo) || 0;
        this.descricao = descricao ? String(descricao).trim() : '';
    }

    /**
     * Retorna um objeto Date a partir da string de data.
     * @returns {Date|null} - O objeto Date ou null se a data for inválida.
     */
    getDataObjeto() {
        if (!this.data) return null;
        const dateObj = new Date(`${this.data}T00:00:00`);
        if (!isNaN(dateObj.getTime())) return dateObj;
        console.warn(`Formato data inválido: ${this.data}`);
        return null;
    }

    /**
     * Valida os dados da manutenção.
     * @returns {boolean} - True se os dados são válidos, false caso contrário.
     */
    validarDados() {
        if (!this.getDataObjeto()) {
            console.error(`Validação Manut.: Data inválida (${this.data})`);
            return false;
        }
        if (!this.tipo) {
            console.error(`Validação Manut.: Tipo vazio`);
            return false;
        }
        if (isNaN(this.custo) || this.custo < 0) {
            console.error(`Validação Manut.: Custo inválido (${this.custo})`);
            return false;
        }
        return true;
    }

    /**
     * Formata a manutenção para exibição.
     * @param {string} [formatoData='DD/MM/AAAA'] - O formato da data ('DD/MM/AAAA' ou outro).
     * @returns {string} - Uma string formatada para exibição.
     */
    formatarParaExibicao(formatoData = 'DD/MM/AAAA') {
        let df = 'Data Inválida';
        const dO = this.getDataObjeto();
        if (dO) {
            const dia = String(dO.getUTCDate()).padStart(2, '0');
            const mes = String(dO.getUTCMonth() + 1).padStart(2, '0');
            const ano = dO.getUTCFullYear();
            df = (formatoData === 'DD/MM/AAAA') ? `${dia}/${mes}/${ano}` : `${ano}-${mes}-${dia}`;
        }
        const tf = this.tipo || 'Tipo Inválido';
        const cf = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let r = `${tf} em ${df} - ${cf}`;
        if (this.descricao) r += ` (Desc: ${this.descricao})`;
        return r;
    }

    /**
     * Converte a manutenção para um objeto JSON.
     * @returns {object} - Um objeto JSON representando a manutenção.
     */
    toJSON() {
        return { data: this.data, tipo: this.tipo, custo: this.custo, descricao: this.descricao };
    }
}
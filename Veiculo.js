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
        if (this.tipoVeiculo === 'Bicicleta') return; //Bicicleta não liga
        this.ligado = true;
        this.atualizarEstadoNaTela();
        tocarSom(sons.ligar);
        exibirNotificacao(`${this.tipoVeiculo} ${this.modelo} ligado(a).`, 'sucesso');
    }

    /**
     * Desliga o veículo.
     * @returns {void}
     */
    desligar() {
        if (this.tipoVeiculo === 'Bicicleta') return; //Bicicleta não desliga
        this.ligado = false;
        this.velocidade = 0;
        this.atualizarEstadoNaTela();
        this.atualizarVelocidadeNaTela();
        tocarSom(sons.desligar);
        exibirNotificacao(`${this.tipoVeiculo} ${this.modelo} desligado(a).`, 'aviso');
    }

    /**
     * Acelera o veículo.
     * @param {number} incBase - O incremento base de velocidade.
     * @returns {void}
     */
    acelerar(incBase) {
        if (this.tipoVeiculo === 'Bicicleta' && !this.ligado) this.ligar();
        if (!this.ligado) { exibirNotificacao(`${this.tipoVeiculo} ${this.modelo} precisa estar ligado(a).`, 'aviso'); return; }
        const inc = incBase || 10;
        const vMax = this.getVelocidadeMaxima();
        this.velocidade = Math.min(vMax, this.velocidade + inc);
        this.atualizarVelocidadeNaTela();
        tocarSom(sons.acelerar);
    }

    /**
     * Freia o veículo.
     * @param {number} dec - O decremento de velocidade.
     * @returns {void}
     */
    frear(dec) {
        const decremento = dec || 7;
        this.velocidade = Math.max(0, this.velocidade - decremento);
        this.atualizarVelocidadeNaTela();
        tocarSom(sons.frear);
    }

    /**
     * Muda a cor do veículo.
     * @param {string} nCor - A nova cor do veículo.
     * @returns {void}
     */
    mudarCor(nCor) {
        if (!nCor || typeof nCor !== 'string' || nCor.trim() === '') { exibirNotificacao("Cor inválida.", 'erro'); return; }
        this.cor = nCor.trim();
        this.atualizarCorNaTela();
        exibirNotificacao(`${this.tipoVeiculo} ${this.modelo} agora é ${this.cor}.`, 'sucesso');
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
        if (!mObj || !(mObj instanceof Manutencao) || !mObj.validarDados()) {
            exibirNotificacao("Dados de manutenção inválidos.", 'erro');
            console.error("Manutenção inválida:", mObj);
            return false;
        }
        this.historicoManutencao.push(mObj);
        this.historicoManutencao.sort((a, b) => (a.getDataObjeto() || 0) - (b.getDataObjeto() || 0));
        salvarGaragemNoLocalStorage();
        this.exibirInformacoesDetalhes();
        return true;
    }

    /**
     * Filtra e ordena as manutenções do veículo.
     * @param {Function} fData - Uma função de filtro para as datas.
     * @returns {Array<Manutencao>} - Um array de manutenções filtradas e ordenadas.
     * @protected
     */
    _filtrarEOrdenarManutencoes(fData) {
        let lista = this.historicoManutencao;
        if (typeof fData === 'function') lista = lista.filter(fData);
        lista.sort((a, b) => (a.getDataObjeto() || 0) - (b.getDataObjeto() || 0));
        return lista;
    }

    /**
     * Retorna o histórico de manutenções formatado para exibição.
     * @returns {string} - Uma string formatada com o histórico de manutenções.
     */
    getHistoricoManutencaoFormatado() {
        if (!this.historicoManutencao || this.historicoManutencao.length === 0) return 'Nenhuma manutenção registrada.';
        let texto = '';
        this.historicoManutencao.forEach(m => {
            texto += `Data: ${m.data}, Tipo: ${m.tipo}, Custo: R$ ${m.custo.toFixed(2)}`;
            if (m.descricao) texto += `, Descrição: ${m.descricao}`;
            texto += '\n';
        });
        return texto;
    }

    /**
     * Retorna os agendamentos futuros formatados para exibição.
     * @returns {string} - Uma string formatada com os agendamentos futuros.
     */
    getAgendamentosFuturosFormatado() {
        return "N/A"; // Por enquanto, não implementamos agendamentos futuros
    }

    /**
     * Atualiza a velocidade exibida na tela.
     * @returns {void}
     */
    atualizarVelocidadeNaTela() {
        const el = this._findElement('velocidade');
        if (el) el.textContent = this.velocidade.toFixed(this instanceof Caminhao ? 1 : 0) + ' km/h';
        const elP = this._findElement('barra-progresso');
        if (elP) {
            const perc = (this.velocidade / this.getVelocidadeMaxima()) * 100;
            atualizarBarraDeProgresso(elP, perc);
        }
    }

    /**
     * Atualiza o estado (ligado/desligado) exibido na tela.
     * @returns {void}
     */
    atualizarEstadoNaTela() {
        const el = this._findElement('estado');
        if (el) {
            el.textContent = this.ligado ? 'Ligado' : 'Desligado';
            el.style.color = this.ligado ? 'green' : 'red';
        }
    }

    /**
     * Atualiza a cor exibida na tela.
     * @returns {void}
     */
    atualizarCorNaTela() {
        const el = this._findElement('cor');
        if (el) el.textContent = this.cor;
        this.atualizarCardCompletoNaTela();
    }

    /**
     * Atualiza todas as informações do card do veículo na tela.
     * @returns {void}
     */
    atualizarCardCompletoNaTela() {
        const card = document.getElementById(this.id);
        if (card) {
            const html = gerarHTMLVeiculo(this);
            card.outerHTML = html;
        }
    }

    /**
     * Adiciona o botão de buzina ao card do veículo.
     * @returns {void}
     */
    adicionarBotaoBuzina() {
        const controlesDiv = this._findElement('controles');
        if (controlesDiv && !controlesDiv.querySelector('.buzina-btn')) {
            const btn = document.createElement('button');
            btn.textContent = 'Buzinar';
            btn.className = 'buzina-btn';
            btn.dataset.action = 'buzinar';
            btn.dataset.id = this.id;
            controlesDiv.appendChild(btn);
        }
    }

    /**
     * Exibe as informações detalhadas do veículo no modal.
     * @returns {string} - Uma string formatada com as informações do veículo.
     */
    exibirInformacoesDetalhes() {
        const imgN = this.tipoVeiculo.toLowerCase(), imgE = '.jpg', imgS = `img/${imgN}${imgE}`;
        let html = `
            <h3>${this.tipoVeiculo} ${this.modelo}</h3>
            <img src="${imgS}" alt="Imagem ${this.modelo}" class="detalhes-imagem" onerror="this.src='img/placeholder.png'">
            <div class="detalhes-info-basica">
                <p><strong>Modelo:</strong> <span>${this.modelo}</span></p>
                <p><strong>Cor:</strong> <span id="${this.id}_cor">${this.cor}</span></p>
                <p><strong>Estado:</strong> <span id="${this.id}_estado" style="color:${this.ligado ? 'green' : 'red'}">${this.ligado ? 'Ligado' : 'Desligado'}</span></p>
                <p><strong>Velocidade:</strong> <span id="${this.id}_velocidade">${this.velocidade.toFixed(this instanceof Caminhao ? 1 : 0)} km/h</span></p>
        `;

        if (this instanceof CarroEsportivo) {
            html += `<p><strong>Turbo:</strong> <span id="${this.id}_turbo" style="color:orange">${this.turboAtivado ? 'Ativado' : 'Desativado'}</span></p>`;
        }

        if (this instanceof Caminhao) {
            html += `<p><strong>Capacidade de Carga:</strong> <span>${this.capacidadeCarga.toFixed(0)} kg</span></p>`;
            html += `<p><strong>Carga Atual:</strong> <span>${this.cargaAtual.toFixed(0)} kg</span></p>`;
        }

        html += `</div><h4>Histórico de Manutenção</h4>`;
        if (this.historicoManutencao.length === 0) {
            html += `<p class="detalhes-sem-manutencao">Nenhuma manutenção registrada.</p>`;
        } else {
            html += `<pre class="detalhes-historico">${this.getHistoricoManutencaoFormatado()}</pre>`;
        }

        html += `<h4>Próximos Agendamentos</h4>`;
        html += `<pre id="agendamentos-futuros-conteudo">${this.getAgendamentosFuturosFormatado()}</pre>`;

        return html;
    }

    /**
     * Converte o veículo para um objeto JSON.
     * @returns {object} - Um objeto JSON representando o veículo.
     */
    toJSON() {
        const obj = {
            modelo: this.modelo,
            cor: this.cor,
            tipoVeiculo: this.tipoVeiculo,
            id: this.id,
            ligado: this.ligado,
            velocidade: this.velocidade,
            historicoManutencao: this.historicoManutencao,
        };

        if (this instanceof CarroEsportivo) obj.turboAtivado = this.turboAtivado;
        if (this instanceof Caminhao) {
            obj.capacidadeCarga = this.capacidadeCarga;
            obj.cargaAtual = this.cargaAtual;
        }

        return obj;
    }
}
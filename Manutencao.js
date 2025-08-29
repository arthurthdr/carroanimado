import mongoose from 'mongoose';

// --- A Planta da nossa "Caixinha" de Manutenção ---
// Aqui descrevemos exatamente o que cada caixinha deve ter.
const manutencaoSchema = new mongoose.Schema({
    
    // O que foi feito? Ex: "Troca de óleo e filtro"
    descricaoServico: {
        type: String,
        required: [true, 'A descrição do serviço é obrigatória.'] // Não pode ficar em branco!
    },

    // Quando foi feito?
    data: {
        type: Date,
        required: true,
        default: Date.now // Se não falarmos a data, ele usa a data de agora.
    },

    // Quanto custou?
    custo: {
        type: Number,
        required: [true, 'O custo é obrigatório.'],
        min: [0, 'O custo não pode ser negativo.'] // Não pode ser um número negativo!
    },

    // Com quantos quilômetros o carro estava?
    quilometragem: {
        type: Number,
        min: [0, 'A quilometragem não pode ser negativa.']
    },
    
    // --- O BARBANTE MÁGICO! ---
    // Este é o campo que conecta a manutenção ao veículo.
    veiculo: {
        type: mongoose.Schema.Types.ObjectId, // Diz que vamos guardar um ID único de outro lugar.
        ref: 'Veiculo', // Diz que esse ID é de um documento do modelo 'Veiculo'.
        required: true // Toda manutenção PRECISA pertencer a um veículo.
    }
}, {
    timestamps: true // Adiciona automaticamente os campos 'createdAt' e 'updatedAt'.
});

// Criamos o modelo a partir da planta, e agora podemos usá-lo para criar, ler, etc.
const Manutencao = mongoose.model('Manutencao', manutencaoSchema);

export default Manutencao;
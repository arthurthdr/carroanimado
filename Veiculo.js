import mongoose from 'mongoose';

// 1. Definindo o Schema (a "planta" dos documentos na coleção 'veiculos')
// Aqui definimos os campos, seus tipos e regras (validações).
const veiculoSchema = new mongoose.Schema({
    placa: {
        type: String,
        required: [true, 'A placa é obrigatória.'], // Validação: obrigatório
        unique: true, // Validação: não pode haver placas duplicadas
        uppercase: true,
        trim: true // Remove espaços em branco
    },
    marca: { type: String, required: [true, 'A marca é obrigatória.'] },
    modelo: { type: String, required: [true, 'O modelo é obrigatório.'] },
    ano: {
        type: Number,
        required: [true, 'O ano é obrigatório.'],
        min: [1900, 'O ano deve ser no mínimo 1900.'],
        max: [new Date().getFullYear() + 1, 'O ano não pode ser no futuro.']
    },
    cor: { type: String, required: [true, 'A cor é obrigatória.'] }
}, {
    timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

// 2. Criar o Modelo a partir do Schema
// O Modelo é como uma "classe" que representa a coleção no MongoDB.
// É a nossa ferramenta para Criar, Ler, Atualizar e Deletar veículos no banco.
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;

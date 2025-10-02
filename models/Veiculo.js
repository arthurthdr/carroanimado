import mongoose from 'mongoose';

// 1. Definindo o Schema (a "planta" dos seus documentos)
const veiculoSchema = new mongoose.Schema(
    // --- OBJETO DE DEFINIÇÃO DOS CAMPOS (começa aqui) ---
    {
        placa: {
            type: String,
            required: [true, 'A placa é obrigatória.'],
            unique: true,
            uppercase: true,
            trim: true
        },
        marca: { 
            type: String, 
            required: [true, 'A marca é obrigatória.'] 
        },
        modelo: { 
            type: String, 
            required: [true, 'O modelo é obrigatório.'] 
        },
        ano: {
            type: Number,
            required: [true, 'O ano é obrigatório.'],
            min: [1900, 'O ano deve ser no mínimo 1900.'],
            max: [new Date().getFullYear() + 1, 'O ano não pode ser no futuro.']
        },
        cor: { 
            type: String, 
            required: [true, 'A cor é obrigatória.'] 
        },
        // O campo do dono entra aqui, junto com os outros!
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

         tipo: {
        type: String,
        required: true,
        enum: ['Carro', 'Moto', 'Bicicleta', 'CarroEsportivo'] // Só permite esses valores
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
    },
   
   
    
    {
        timestamps: true // Adiciona createdAt e updatedAt automaticamente
    }

   
);



// 2. Criar o Modelo a partir do Schema
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;
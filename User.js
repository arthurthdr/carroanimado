import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true, // Garante que cada e-mail só pode ser cadastrado uma vez.
        lowercase: true, // Salva o e-mail sempre em letras minúsculas.
        trim: true
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória.'],
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
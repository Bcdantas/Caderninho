// CAMINHO: caderninho-backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'O nome de usuário é obrigatório.'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória.'],
        minlength: 6,
    },
    // ## GARANTIR QUE O CAMPO ROLE ESTEJA ASSIM ##
    role: {
        type: String,
        enum: ['admin', 'employee'], // Define os únicos valores possíveis
        default: 'employee',       // Define 'employee' como o padrão
    },
}, {
    timestamps: true,
});

// Middleware para criptografar a senha antes de salvar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar a senha digitada com a senha no banco de dados
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Para criptografar senhas

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true // Remove espaços em branco do início e fim
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'employee'], // Define os papéis permitidos
        default: 'employee'
    }
}, {
    timestamps: true // Adiciona campos createdAt e updatedAt automaticamente
});

// Pré-salvamento: Hash da senha antes de salvar o usuário
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Só aplica o hash se a senha foi modificada
        return next();
    }
    const salt = await bcrypt.genSalt(10); // Gera um "sal" para o hash
    this.password = await bcrypt.hash(this.password, salt); // Aplica o hash
    next();
});

// Método para comparar a senha fornecida com a senha criptografada
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
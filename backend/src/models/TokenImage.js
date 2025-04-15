const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Importa il modello User per l'associazione

const TokenImage = sequelize.define('TokenImage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false, // L'URL dell'immagine è obbligatorio
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false, // Il nome del token è obbligatorio
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Data di caricamento
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Ultima modifica
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // ID dell'utente che ha caricato il token
    },
}, {
    timestamps: true, // Include createdAt e updatedAt automaticamente
    tableName: 'TokenImages', // Nome della tabella nel database
});

// Associazione tra TokenImage e User
TokenImage.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Ogni TokenImage appartiene a un utente
User.hasMany(TokenImage, { foreignKey: 'userId', as: 'tokens' }); // Un utente può avere molti TokenImage

module.exports = TokenImage;
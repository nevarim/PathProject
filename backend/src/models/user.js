const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stayConnectedToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isTemporary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    avatar: { // Percorso per l'immagine dell'avatar
        type: DataTypes.STRING,
        allowNull: true,
    },
    displayName: { // Nome visualizzato dell'utente
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: { // Email dell'utente
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    lastLogin: { // Ultimo accesso dell'utente
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    preferredLanguage: { // Lingua preferita dall'utente
        type: DataTypes.STRING,
        defaultValue: 'en',
    },
    chatColor: { // Colore preferito per la chat
        type: DataTypes.STRING,
        defaultValue: '#000000',
    },
    friendsList: { // Lista amici
        type: DataTypes.JSON,
        allowNull: true,
    },
    blockedUsers: { // Lista utenti bloccati
        type: DataTypes.JSON,
        allowNull: true,
    },
    biography: { // Breve descrizione personale
        type: DataTypes.TEXT,
        allowNull: true,
    },
    theme: { // Tema preferito (chiaro/scuro)
        type: DataTypes.ENUM('dark', 'light'),
        defaultValue: 'dark',
    },
    xp: { // Esperienza accumulata
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    achievements: { // Obiettivi sbloccati
        type: DataTypes.JSON,
        allowNull: true,
    },
    twoFactorEnabled: { // 2FA abilitata
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    ipLog: { // Ultimi IP utilizzati
        type: DataTypes.JSON,
        allowNull: true,
    },
    isBanned: { // Status ban
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true, // Include createdAt e updatedAt
    tableName: 'users',
});

module.exports = User;
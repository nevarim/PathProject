const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true, // Descrizione opzionale
    },
    cover: {
        type: DataTypes.STRING, // Percorso dell'immagine ridimensionata
        allowNull: true, // Il campo cover è opzionale
    },
    originalCover: { // Nuovo campo per il percorso dell'immagine originale
        type: DataTypes.STRING, // Salva il percorso della cover originale come stringa
        allowNull: true, // Il campo originalCover è opzionale
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false, // Deve avere l'ID del creatore
    },
}, {
    timestamps: true, // Abilita createdAt e updatedAt
});

module.exports = Room;
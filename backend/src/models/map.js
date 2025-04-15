const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Map = sequelize.define('Map', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    roomId: { // ID della stanza a cui appartiene la mappa
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isVisibleToPlayers: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    mapSize: { // Dimensione della mappa (es. [larghezza, altezza])
        type: DataTypes.STRING,
        allowNull: true,
    },
    gridSize: { // Dimensione della griglia sulla mappa
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true, // Abilita createdAt e updatedAt
});

module.exports = Map;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Map = require('./Map');
const TokenImage = require('./TokenImage');

const MapToken = sequelize.define('MapToken', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    mapId: { // ID della mappa di appartenenza
        type: DataTypes.INTEGER,
        references: {
            model: Map,
            key: 'id',
        },
        allowNull: false,
    },
    tokenId: { // ID del token associato
        type: DataTypes.INTEGER,
        references: {
            model: TokenImage,
            key: 'id',
        },
        allowNull: false,
    },
    x: { // Coordinata X sulla griglia
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    y: { // Coordinata Y sulla griglia
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    width: { // Larghezza del token in celle
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    height: { // Altezza del token in celle
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    isVisible: { // Visibilità del token
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
});

// Associazioni
MapToken.belongsTo(Map, { foreignKey: 'mapId', as: 'map' });
MapToken.belongsTo(TokenImage, { foreignKey: 'tokenId', as: 'token' });

module.exports = MapToken;
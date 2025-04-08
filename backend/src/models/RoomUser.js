const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoomUser = sequelize.define('RoomUser', {
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('player', 'gm'),
        defaultValue: 'player', // Ruolo predefinito
    },
}, {
    timestamps: true, // Gestisce automaticamente `joinedAt`
});

module.exports = RoomUser;
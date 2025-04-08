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
    avatar: { // Nuovo campo per il percorso dell'avatar
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true, // createdAt e updatedAt
});

module.exports = User;
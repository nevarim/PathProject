const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chatlogs = sequelize.define('Chatlogs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Rooms', // Nome della tabella collegata
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Nome della tabella collegata
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'chatlogs',
    timestamps: false, // `createdAt` è già presente, non serve `updatedAt`
});

module.exports = Chatlogs;
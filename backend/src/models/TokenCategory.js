const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenCategory = sequelize.define('TokenCategory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    timestamps: true, // Include createdAt e updatedAt automaticamente
    tableName: 'TokenCategories',
});

module.exports = TokenCategory;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Categoria = sequelize.define('Categoria', {
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: { msg: 'El nombre de la categoría es obligatorio' } }
    },
    descripcion: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'categorias',
    timestamps: true
});

module.exports = Categoria;

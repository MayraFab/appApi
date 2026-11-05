const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Producto = sequelize.define('Producto', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: 'El nombre del producto es obligatorio' } }
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: { args: [0], msg: 'El precio no puede ser negativo' } }
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: { args: [0], msg: 'El stock no puede ser negativo' } }
    },
    stock_minimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: { min: { args: [0], msg: 'El stock mínimo no puede ser negativo' } }
    }
    // categoria_id y proveedor_id se crean con las asociaciones (models/index.js)
}, {
    tableName: 'productos',
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

module.exports = Producto;

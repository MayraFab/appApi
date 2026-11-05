const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Movimiento = sequelize.define('Movimiento', {
    tipo_movimiento: {
        type: DataTypes.ENUM('Entrada', 'Salida', 'Ajuste'),
        allowNull: false
    },
    cantidad: {
        // Entrada y Salida: siempre positiva. Ajuste: positiva (+) o negativa (-)
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stock_anterior: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stock_nuevo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    observaciones: {
        type: DataTypes.TEXT
    },
    estado: {
        type: DataTypes.ENUM('Activo', 'Anulado'),
        allowNull: false,
        defaultValue: 'Activo'
    }
    // producto_id y usuario_id se crean con las asociaciones (models/index.js)
}, {
    tableName: 'movimientos',
    timestamps: true
});

module.exports = Movimiento;

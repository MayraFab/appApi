const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Proveedor = sequelize.define('Proveedor', {
    razon_social: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: { msg: 'La razón social es obligatoria' } }
    },
    contacto: {
        type: DataTypes.STRING(100)
    },
    telefono: {
        type: DataTypes.STRING(20)
    },
    email: {
        type: DataTypes.STRING(100),
        set(valor) { this.setDataValue('email', valor || null); }, // '' → NULL
        validate: { isEmail: { msg: 'El email del proveedor no es válido' } }
    }
}, {
    tableName: 'proveedores',
    timestamps: true
});

module.exports = Proveedor;

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: { msg: 'El nombre es obligatorio' } }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: 'El email no es válido' } }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { len: { args: [6, 255], msg: 'La contraseña debe tener al menos 6 caracteres' } }
    },
    rol: {
        type: DataTypes.ENUM('Administrador', 'Almacenero', 'Supervisor'),
        allowNull: false,
        defaultValue: 'Almacenero'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    // Por defecto NUNCA se devuelve la contraseña en las consultas
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    hooks: {
        // Encripta la contraseña antes de guardarla (al crear o al cambiarla)
        beforeSave: async (usuario) => {
            if (usuario.changed('password')) {
                usuario.password = await bcrypt.hash(usuario.password, 10);
            }
        }
    }
});

// Aunque el objeto tenga la contraseña cargada, no se envía en el JSON
Usuario.prototype.toJSON = function () {
    const valores = { ...this.get() };
    delete valores.password;
    return valores;
};

module.exports = Usuario;

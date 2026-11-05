// Punto central de los modelos: aquí se definen las RELACIONES (llaves foráneas)
const sequelize = require('../config/db');
const Categoria = require('./Categoria');
const Proveedor = require('./Proveedor');
const Usuario = require('./Usuario');
const Producto = require('./Producto');
const Movimiento = require('./Movimiento');

// 1. Categoría 1 ── N Productos (un producto DEBE tener categoría)
Categoria.hasMany(Producto, {
    foreignKey: { name: 'categoria_id', allowNull: false },
    as: 'productos',
    onDelete: 'RESTRICT' // No se puede borrar una categoría que tiene productos
});
Producto.belongsTo(Categoria, {
    foreignKey: { name: 'categoria_id', allowNull: false },
    as: 'categoria'
});

// 2. Proveedor 1 ── N Productos (el proveedor es opcional)
Proveedor.hasMany(Producto, {
    foreignKey: { name: 'proveedor_id', allowNull: true },
    as: 'productos',
    onDelete: 'SET NULL' // Si se borra el proveedor, el producto queda sin proveedor
});
Producto.belongsTo(Proveedor, {
    foreignKey: { name: 'proveedor_id', allowNull: true },
    as: 'proveedor'
});

// 3. Producto 1 ── N Movimientos (Kardex)
Producto.hasMany(Movimiento, {
    foreignKey: { name: 'producto_id', allowNull: false },
    as: 'movimientos',
    onDelete: 'RESTRICT' // No se puede borrar un producto con historial
});
Movimiento.belongsTo(Producto, {
    foreignKey: { name: 'producto_id', allowNull: false },
    as: 'producto'
});

// 4. Usuario 1 ── N Movimientos (quién registró cada movimiento)
Usuario.hasMany(Movimiento, {
    foreignKey: { name: 'usuario_id', allowNull: false },
    as: 'movimientos',
    onDelete: 'RESTRICT'
});
Movimiento.belongsTo(Usuario, {
    foreignKey: { name: 'usuario_id', allowNull: false },
    as: 'usuario'
});

module.exports = { sequelize, Categoria, Proveedor, Usuario, Producto, Movimiento };

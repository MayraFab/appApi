const { Proveedor, sequelize } = require('../models');
const crudController = require('./crudController');

// Además de sus campos, cada proveedor devuelve cuántos productos abastece
const totalProductos = [
    sequelize.literal('(SELECT COUNT(*) FROM productos p WHERE p.proveedor_id = `Proveedor`.`id`)'),
    'total_productos'
];

module.exports = crudController(Proveedor, 'Proveedor', {
    attributes: { include: [totalProductos] }
});

const { Categoria, sequelize } = require('../models');
const crudController = require('./crudController');

// Además de sus campos, cada categoría devuelve cuántos productos tiene
const totalProductos = [
    sequelize.literal('(SELECT COUNT(*) FROM productos p WHERE p.categoria_id = `Categoria`.`id`)'),
    'total_productos'
];

module.exports = crudController(Categoria, 'Categoría', {
    attributes: { include: [totalProductos] },
    mensajeEnUso: 'No se puede eliminar: la categoría tiene productos asociados'
});

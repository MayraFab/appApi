const { Op } = require('sequelize');
const { sequelize, Producto, Categoria, Proveedor, Usuario, Movimiento } = require('../models');

// Condición "stock <= stock_minimo" (compara dos columnas de la misma fila)
const condicionBajoStock = sequelize.where(sequelize.col('stock'), Op.lte, sequelize.col('stock_minimo'));

// GET /dashboard  → indicadores (KPI) para la vista de Inicio
const resumen = async (req, res) => {
    const [
        totalProductos, totalCategorias, totalProveedores, usuariosActivos,
        bajoStock, valorInventario, productosBajoStock, movimientosRecientes, stockPorCategoria
    ] = await Promise.all([
        Producto.count(),
        Categoria.count(),
        Proveedor.count(),
        Usuario.count({ where: { activo: true } }),
        Producto.count({ where: condicionBajoStock }),
        Producto.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.literal('precio * stock')), 'total']],
            raw: true
        }),
        Producto.findAll({
            where: condicionBajoStock,
            attributes: ['id', 'nombre', 'stock', 'stock_minimo'],
            order: [['stock', 'ASC']],
            limit: 5
        }),
        Movimiento.findAll({
            include: [
                { model: Producto, as: 'producto', attributes: ['id', 'nombre'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'rol'] }
            ],
            order: [['fecha_hora', 'DESC'], ['id', 'DESC']],
            limit: 6
        }),
        Categoria.findAll({
            attributes: [
                'id', 'nombre',
                [sequelize.literal('(SELECT COALESCE(SUM(p.stock), 0) FROM productos p WHERE p.categoria_id = `Categoria`.`id`)'), 'stock_total']
            ],
            order: [['nombre', 'ASC']]
        })
    ]);

    res.json({
        totalProductos,
        totalCategorias,
        totalProveedores,
        usuariosActivos,
        bajoStock,
        valorInventario: Number(valorInventario?.total) || 0,
        productosBajoStock,
        movimientosRecientes,
        stockPorCategoria
    });
};

module.exports = { resumen };

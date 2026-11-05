const { Movimiento, Producto, Usuario, sequelize } = require('../models');
const { registrarMovimiento, anularMovimiento, errorHttp } = require('../services/inventarioService');

const relaciones = [
    { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'stock'] },
    { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'rol'] }
];

const buscarOFallar = async (id) => {
    const movimiento = await Movimiento.findByPk(id, { include: relaciones });
    if (!movimiento) throw errorHttp(404, 'Movimiento no encontrado');
    return movimiento;
};

// GET /movimientos  (opcional: ?producto_id=3 para ver el Kardex de un producto)
const listar = async (req, res) => {
    const where = {};
    if (req.query.producto_id) where.producto_id = req.query.producto_id;

    const movimientos = await Movimiento.findAll({
        where,
        include: relaciones,
        order: [['fecha_hora', 'DESC'], ['id', 'DESC']]
    });
    res.json(movimientos);
};

// GET /movimientos/:id
const obtener = async (req, res) => {
    res.json(await buscarOFallar(req.params.id));
};

// POST /movimientos
// TRANSACCIÓN: inserta el movimiento y actualiza el stock del producto.
// Si cualquiera de las dos operaciones falla, se hace ROLLBACK de ambas.
const crear = async (req, res) => {
    const movimiento = await sequelize.transaction((t) => registrarMovimiento(req.body, t));
    res.status(201).json(await buscarOFallar(movimiento.id));
};

// PATCH /movimientos/:id/anular  (revierte el stock, también en transacción)
const anular = async (req, res) => {
    const movimiento = await sequelize.transaction((t) => anularMovimiento(req.params.id, t));
    res.json(await buscarOFallar(movimiento.id));
};

module.exports = { listar, obtener, crear, anular };

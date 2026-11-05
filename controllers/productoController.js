const { Producto, Categoria, Proveedor, Movimiento, sequelize } = require('../models');
const { registrarMovimiento, errorHttp } = require('../services/inventarioService');

// Relaciones que se devuelven junto a cada producto (JOIN)
const relaciones = [
    { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
    { model: Proveedor, as: 'proveedor', attributes: ['id', 'razon_social'] }
];

const buscarOFallar = async (id) => {
    const producto = await Producto.findByPk(id, { include: relaciones });
    if (!producto) throw errorHttp(404, 'Producto no encontrado');
    return producto;
};

// Valida que la categoría (obligatoria) y el proveedor (opcional) existan
const validarRelaciones = async ({ categoria_id, proveedor_id }) => {
    if (!categoria_id) throw errorHttp(400, 'Debe seleccionar una categoría');
    if (!(await Categoria.findByPk(categoria_id))) throw errorHttp(400, 'La categoría seleccionada no existe');
    if (proveedor_id && !(await Proveedor.findByPk(proveedor_id))) {
        throw errorHttp(400, 'El proveedor seleccionado no existe');
    }
};

// GET /productos
const listar = async (req, res) => {
    const productos = await Producto.findAll({ include: relaciones, order: [['id', 'ASC']] });
    res.json(productos);
};

// GET /productos/:id
const obtener = async (req, res) => {
    res.json(await buscarOFallar(req.params.id));
};

// POST /productos
// El stock NO se escribe directamente: si viene "stock_inicial", se registra
// una Entrada en el Kardex dentro de la MISMA transacción.
const crear = async (req, res) => {
    const { stock_inicial, usuario_id, ...datos } = req.body;
    datos.proveedor_id = datos.proveedor_id || null;
    await validarRelaciones(datos);

    const cantidadInicial = Number(stock_inicial) || 0;
    if (cantidadInicial > 0 && !usuario_id) {
        throw errorHttp(400, 'Indique qué usuario registra el stock inicial');
    }

    const producto = await sequelize.transaction(async (t) => {
        const nuevo = await Producto.create({ ...datos, stock: 0 }, { transaction: t });
        if (cantidadInicial > 0) {
            await registrarMovimiento({
                producto_id: nuevo.id,
                usuario_id,
                tipo_movimiento: 'Entrada',
                cantidad: cantidadInicial,
                observaciones: 'Stock inicial al registrar el producto'
            }, t);
        }
        return nuevo;
    });

    res.status(201).json(await buscarOFallar(producto.id));
};

// PUT /productos/:id  (el stock solo cambia desde el Kardex)
const actualizar = async (req, res) => {
    const { stock, stock_inicial, usuario_id, ...datos } = req.body;
    datos.proveedor_id = datos.proveedor_id || null;
    const producto = await buscarOFallar(req.params.id);
    await validarRelaciones({ ...producto.get(), ...datos });
    await producto.update(datos);
    res.json(await buscarOFallar(producto.id));
};

// DELETE /productos/:id
const eliminar = async (req, res) => {
    const producto = await buscarOFallar(req.params.id);
    const movimientos = await Movimiento.count({ where: { producto_id: producto.id } });
    if (movimientos > 0) {
        throw errorHttp(409, `No se puede eliminar: el producto tiene ${movimientos} movimiento(s) en el Kardex`);
    }
    await producto.destroy();
    res.json({ message: 'Producto eliminado' });
};

module.exports = { listar, obtener, crear, actualizar, eliminar };

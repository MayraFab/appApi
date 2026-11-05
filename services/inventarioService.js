// Lógica de negocio del Kardex: todo cambio de stock pasa por aquí
const { Producto, Usuario, Movimiento } = require('../models');

// Crea un error con código HTTP para que el errorHandler lo responda bien
const errorHttp = (status, mensaje) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};

// Cuánto suma o resta cada tipo de movimiento al stock
const calcularVariacion = (tipo, cantidad) => {
    if (tipo === 'Entrada') return cantidad;
    if (tipo === 'Salida') return -cantidad;
    return cantidad; // Ajuste: ya viene con signo (+ o -)
};

/**
 * Registra un movimiento y actualiza el stock del producto.
 * DEBE ejecutarse dentro de una transacción (t): si algo falla,
 * no se guarda el movimiento NI se modifica el stock.
 */
const registrarMovimiento = async (datos, t) => {
    const tipo = datos.tipo_movimiento;
    const cantidad = Number(datos.cantidad);

    if (!['Entrada', 'Salida', 'Ajuste'].includes(tipo)) {
        throw errorHttp(400, 'Tipo de movimiento no válido (Entrada, Salida o Ajuste)');
    }
    if (!Number.isInteger(cantidad) || cantidad === 0) {
        throw errorHttp(400, 'La cantidad debe ser un número entero distinto de 0');
    }
    if (tipo !== 'Ajuste' && cantidad < 0) {
        throw errorHttp(400, `En una ${tipo} la cantidad debe ser positiva`);
    }

    // lock: UPDATE bloquea la fila del producto hasta terminar la transacción,
    // así dos movimientos simultáneos no leen el mismo stock
    const producto = await Producto.findByPk(datos.producto_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!producto) throw errorHttp(404, 'El producto no existe');

    const usuario = await Usuario.findByPk(datos.usuario_id, { transaction: t });
    if (!usuario) throw errorHttp(404, 'El usuario no existe');
    if (!usuario.activo) throw errorHttp(400, 'El usuario está desactivado');

    const stockAnterior = producto.stock;
    const stockNuevo = stockAnterior + calcularVariacion(tipo, cantidad);
    if (stockNuevo < 0) {
        throw errorHttp(400, `Stock insuficiente: hay ${stockAnterior} unidades de "${producto.nombre}"`);
    }

    // 1) Insertar el registro en el Kardex
    const movimiento = await Movimiento.create({
        producto_id: producto.id,
        usuario_id: usuario.id,
        tipo_movimiento: tipo,
        cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        fecha_hora: datos.fecha_hora || new Date(),
        observaciones: datos.observaciones || null
    }, { transaction: t });

    // 2) Actualizar el stock del producto (en la MISMA transacción)
    await producto.update({ stock: stockNuevo }, { transaction: t });

    return movimiento;
};

/**
 * Anula un movimiento: revierte su efecto en el stock y lo marca como "Anulado".
 * No se borra, para conservar el historial (auditoría).
 */
const anularMovimiento = async (id, t) => {
    const movimiento = await Movimiento.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!movimiento) throw errorHttp(404, 'El movimiento no existe');
    if (movimiento.estado === 'Anulado') throw errorHttp(400, 'El movimiento ya está anulado');

    const producto = await Producto.findByPk(movimiento.producto_id, { transaction: t, lock: t.LOCK.UPDATE });
    const stockRevertido = producto.stock - calcularVariacion(movimiento.tipo_movimiento, movimiento.cantidad);
    if (stockRevertido < 0) {
        throw errorHttp(400, 'No se puede anular: el stock quedaría negativo');
    }

    await producto.update({ stock: stockRevertido }, { transaction: t });
    await movimiento.update({ estado: 'Anulado' }, { transaction: t });
    return movimiento;
};

module.exports = { registrarMovimiento, anularMovimiento, errorHttp };

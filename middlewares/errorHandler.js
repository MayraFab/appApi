// Middleware central de errores: convierte cualquier error en una respuesta JSON clara
const errorHandler = (err, req, res, next) => {
    // Errores de validación del modelo (campos vacíos, email inválido, etc.)
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.errors.map(e => e.message).join('. ') });
    }
    // Valor repetido en un campo UNIQUE (ej. email o nombre de categoría)
    if (err.name === 'SequelizeUniqueConstraintError') {
        const campo = err.errors?.[0]?.path || 'valor';
        return res.status(409).json({ error: `Ya existe un registro con ese ${campo}` });
    }
    // Llave foránea: se intenta borrar algo que otros registros usan
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ error: 'No se puede eliminar: el registro está siendo usado por otros datos' });
    }
    // Errores propios (errorHttp) o desconocidos
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: err.message || 'Error interno del servidor' });
};

module.exports = errorHandler;

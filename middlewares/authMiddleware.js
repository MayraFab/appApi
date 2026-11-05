// Middleware de protección de rutas con JWT + control de acceso por roles (RBAC)
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * autenticar()                         → cualquier usuario con sesión válida
 * autenticar(['Administrador'])        → solo esos roles
 */
const autenticar = (rolesPermitidos = []) => async (req, res, next) => {
    // 1) Obtener el token del encabezado:  Authorization: Bearer <token>
    const authHeader = req.headers.authorization || '';
    const [tipo, token] = authHeader.split(' ');

    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Acceso denegado: token no proporcionado.' });
    }

    // 2) Verificar firma y expiración
    let datos;
    try {
        datos = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        const mensaje = error.name === 'TokenExpiredError'
            ? 'La sesión expiró. Inicie sesión nuevamente.'
            : 'Sesión inválida o expirada.';
        return res.status(401).json({ error: mensaje });
    }

    // 3) Confirmar que el usuario sigue existiendo y está activo
    //    (si un admin lo desactiva, pierde el acceso aunque su token no haya vencido)
    const usuario = await Usuario.findByPk(datos.id);
    if (!usuario || !usuario.activo) {
        return res.status(401).json({ error: 'El usuario no existe o está desactivado.' });
    }

    // 4) Validar el rol (RBAC). Se usa el rol de la BD, no el del token, por si cambió
    if (rolesPermitidos.length && !rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ error: 'No autorizado: permisos insuficientes.' });
    }

    // 5) Adjuntar el usuario a la petición y continuar
    req.usuario = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
    next();
};

/**
 * permitir('Administrador', ...) → verifica SOLO el rol.
 * Se usa en rutas que ya pasaron por autenticar() (ver routes/index.js),
 * así no se vuelve a consultar la base de datos.
 */
const permitir = (...roles) => (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: 'Acceso denegado: inicie sesión.' });
    if (!roles.includes(req.usuario.rol)) {
        return res.status(403).json({ error: 'No autorizado: permisos insuficientes.' });
    }
    next();
};

module.exports = { autenticar, permitir };

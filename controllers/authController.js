// Registro, inicio de sesión (JWT) y perfil del usuario autenticado
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { errorHttp } = require('../services/inventarioService');
const ROLES = require('../config/roles');

// Contraseña segura: mínimo 8 caracteres, con letras y números
const PASSWORD_SEGURA = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// Datos públicos del usuario (nunca la contraseña)
const datosPublicos = (u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });

// POST /api/auth/register  (público)
// El rol se fija en "Almacenero": un visitante NO puede auto-asignarse "Administrador"
// (los demás roles los crea un administrador desde /api/usuarios).
const registrar = async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!PASSWORD_SEGURA.test(password || '')) {
        throw errorHttp(400, 'La contraseña debe tener al menos 8 caracteres, con letras y números');
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) throw errorHttp(400, 'El correo ya se encuentra registrado');

    // El hook beforeSave del modelo cifra la contraseña con bcrypt (hash + salt)
    const nuevo = await Usuario.create({ nombre, email, password, rol: ROLES.ALMACENERO });
    res.status(201).json({ message: 'Usuario registrado exitosamente', usuario: datosPublicos(nuevo) });
};

// POST /api/auth/login  (público, con límite de intentos)
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw errorHttp(400, 'Ingrese email y contraseña');

    // unscoped(): el defaultScope oculta la contraseña, aquí la necesitamos para compararla
    const usuario = await Usuario.unscoped().findOne({ where: { email } });

    // Mismo mensaje si falla el email o la contraseña: no se revela qué cuentas existen
    const passwordCorrecto = usuario && await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecto) throw errorHttp(401, 'Credenciales inválidas');
    if (!usuario.activo) throw errorHttp(403, 'Usuario desactivado. Contacte al administrador');

    // Generar el JWT firmado con la clave secreta del .env
    const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    res.json({ message: 'Inicio de sesión exitoso', token, usuario: datosPublicos(usuario) });
};

// GET /api/auth/perfil  (requiere token) → quién soy
const perfil = async (req, res) => {
    res.json(req.usuario);
};

module.exports = { registrar, login, perfil };

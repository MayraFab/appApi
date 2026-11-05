const { Usuario } = require('../models');
const { errorHttp } = require('../services/inventarioService');

const buscarOFallar = async (id) => {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) throw errorHttp(404, 'Usuario no encontrado');
    return usuario;
};

// GET /usuarios  (la contraseña nunca se devuelve: defaultScope del modelo)
const listar = async (req, res) => {
    res.json(await Usuario.findAll({ order: [['id', 'ASC']] }));
};

// GET /usuarios/:id
const obtener = async (req, res) => {
    res.json(await buscarOFallar(req.params.id));
};

// POST /usuarios  (el hook beforeSave encripta la contraseña con bcrypt)
const crear = async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    const usuario = await Usuario.create({ nombre, email, password, rol });
    res.status(201).json(usuario);
};

// PUT /usuarios/:id  (si la contraseña viene vacía, se mantiene la anterior)
const actualizar = async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    const usuario = await buscarOFallar(req.params.id);
    const datos = { nombre, email, rol };
    if (password) datos.password = password;
    await usuario.update(datos);
    res.json(usuario);
};

// PATCH /usuarios/:id/estado  (activar / desactivar en vez de borrar)
const cambiarEstado = async (req, res) => {
    const usuario = await buscarOFallar(req.params.id);
    if (usuario.id === req.usuario.id) {
        throw errorHttp(400, 'No puede desactivar su propia cuenta');
    }
    await usuario.update({ activo: !usuario.activo });
    res.json(usuario);
};

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };

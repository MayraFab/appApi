const { Router } = require('express');
const c = require('../controllers/usuarioController');
const { permitir } = require('../middlewares/authMiddleware');
const { ADMIN } = require('../config/roles');

const router = Router();
// Toda la gestión de usuarios es exclusiva del Administrador
router.use(permitir(ADMIN));
router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.patch('/:id/estado', c.cambiarEstado); // Activar / Desactivar

module.exports = router;

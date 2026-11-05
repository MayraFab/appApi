const { Router } = require('express');
const c = require('../controllers/usuarioController');

const router = Router();
router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.patch('/:id/estado', c.cambiarEstado); // Activar / Desactivar

module.exports = router;

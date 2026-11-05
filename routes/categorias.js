const { Router } = require('express');
const c = require('../controllers/categoriaController');
const { permitir } = require('../middlewares/authMiddleware');
const { ADMIN, ALMACENERO } = require('../config/roles');

const router = Router();
// Lectura: cualquier usuario con sesión (el token se valida en routes/index.js)
router.get('/', c.listar);
router.get('/:id', c.obtener);
// Escritura: Administrador y Almacenero. Eliminar: solo Administrador
router.post('/', permitir(ADMIN, ALMACENERO), c.crear);
router.put('/:id', permitir(ADMIN, ALMACENERO), c.actualizar);
router.delete('/:id', permitir(ADMIN), c.eliminar);

module.exports = router;

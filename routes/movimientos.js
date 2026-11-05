const { Router } = require('express');
const c = require('../controllers/movimientoController');
const { permitir } = require('../middlewares/authMiddleware');
const { ADMIN, ALMACENERO, SUPERVISOR } = require('../config/roles');

const router = Router();
router.get('/', c.listar);
router.get('/:id', c.obtener);
// Registrar Entrada / Salida / Ajuste: personal de almacén
router.post('/', permitir(ADMIN, ALMACENERO), c.crear);
// Anular (revierte el stock): solo quien supervisa
router.patch('/:id/anular', permitir(ADMIN, SUPERVISOR), c.anular);

module.exports = router;

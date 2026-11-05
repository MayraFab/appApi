const { Router } = require('express');
const c = require('../controllers/movimientoController');

const router = Router();
router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);                 // Registrar Entrada / Salida / Ajuste
router.patch('/:id/anular', c.anular);     // Anular (revierte el stock)

module.exports = router;

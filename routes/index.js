// Agrupa todas las rutas de la API bajo el prefijo /api
const { Router } = require('express');

const router = Router();
router.use('/dashboard', require('./dashboard'));
router.use('/categorias', require('./categorias'));
router.use('/proveedores', require('./proveedores'));
router.use('/productos', require('./productos'));
router.use('/movimientos', require('./movimientos'));
router.use('/usuarios', require('./usuarios'));

module.exports = router;

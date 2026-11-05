const { Router } = require('express');
const { resumen } = require('../controllers/dashboardController');

const router = Router();
router.get('/', resumen);

module.exports = router;

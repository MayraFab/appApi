const { Router } = require('express');
const c = require('../controllers/authController');
const { autenticar } = require('../middlewares/authMiddleware');
const { limitadorLogin } = require('../middlewares/seguridad');

const router = Router();
router.post('/register', c.registrar);               // Público (rol fijo: Almacenero)
router.post('/login', limitadorLogin, c.login);      // Público, máx. 5 intentos fallidos / 15 min
router.get('/perfil', autenticar(), c.perfil);       // Requiere token

module.exports = router;

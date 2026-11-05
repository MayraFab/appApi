// Protección contra ataques comunes: XSS / Clickjacking (helmet), CORS y fuerza bruta / DoS (rate limit)
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

// 1. HELMET: agrega encabezados HTTP de seguridad
//    (Content-Security-Policy, X-Frame-Options contra clickjacking, nosniff, oculta X-Powered-By, etc.)
const cabecerasSeguras = helmet();

// 2. CORS restrictivo: solo el frontend autorizado puede llamar a la API desde el navegador
const corsRestringido = cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // PATCH: anular movimientos y activar usuarios
    allowedHeaders: ['Content-Type', 'Authorization']
});

// 3. RATE LIMIT general: máximo 300 peticiones por IP cada 15 minutos
//    (el panel hace varias peticiones por vista, por eso se usa un límite mayor que 100)
const limitadorGeneral = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8', // informa el límite en las cabeceras RateLimit
    legacyHeaders: false,
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.' }
});

// 4. RATE LIMIT del login: 5 intentos FALLIDOS por IP cada 15 minutos (anti fuerza bruta)
const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true, // los inicios de sesión correctos no cuentan
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de inicio de sesión. Espere 15 minutos.' }
});

module.exports = { cabecerasSeguras, corsRestringido, limitadorGeneral, limitadorLogin };

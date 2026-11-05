const express = require('express');
require('dotenv').config();

// Importar los modelos (con sus relaciones), las rutas y los middlewares
const { sequelize } = require('./models');
const rutas = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { cabecerasSeguras, corsRestringido, limitadorGeneral } = require('./middlewares/seguridad');

// Sin clave secreta no se pueden firmar tokens: el servidor no debe arrancar
if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en el archivo .env');
    process.exit(1);
}

const app = express();

// --- PROTECCIÓN CONTRA ATAQUES COMUNES ---
app.use(cabecerasSeguras);              // 1. Helmet: XSS, clickjacking, cabeceras seguras
app.use(corsRestringido);               // 2. CORS: solo el frontend autorizado
app.use('/api', limitadorGeneral);      // 3. Rate limit: fuerza bruta y DoS

// Parsear el body a JSON (ANTES de las rutas). Límite de 10 KB contra payloads gigantes
app.use(express.json({ limit: '10kb' }));

// --- RUTAS ---
app.get('/', (req, res) => {
    res.send('¡API Backend funcionando exitosamente!');
});

// /api/auth es público; el resto de /api exige token (ver routes/index.js)
app.use('/api', rutas);

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo central de errores (siempre al final)
app.use(errorHandler);

// --- SINCRONIZACIÓN Y ARRANQUE ---
const PORT = process.env.PORT || 3006;

// force: false evita que se borren los datos cada vez que se reinicia el servidor
sequelize.sync({ force: false })
    .then(() => {
        console.log('Base de datos conectada y sincronizada.');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar con la base de datos:', error);
    });

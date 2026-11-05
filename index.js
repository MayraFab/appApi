const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar los modelos (con sus relaciones) y las rutas
const { sequelize } = require('./models');
const rutas = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --- MIDDLEWARES ---
// Habilitar CORS para permitir peticiones desde el frontend (React)
app.use(cors());
// Parsear el body de las peticiones a JSON
app.use(express.json());

// --- RUTAS ---
app.get('/', (req, res) => {
    res.send('¡API Backend funcionando exitosamente!');
});

// Todas las rutas del sistema de inventario cuelgan de /api
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

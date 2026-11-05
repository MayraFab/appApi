const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        timezone: '-05:00', // Hora de Perú (evita que las fechas se guarden en UTC)
        logging: false      // Para no saturar la consola con consultas SQL
    }
);

module.exports = sequelize;

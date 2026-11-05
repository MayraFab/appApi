// "Fábrica" de controladores CRUD genéricos.
// Evita repetir el mismo código para tablas simples (Categorías, Proveedores).
// Nota: Express 5 captura automáticamente los errores de funciones async
// y los envía al errorHandler, por eso no hace falta try/catch en cada ruta.
const { errorHttp } = require('../services/inventarioService');

const crudController = (Modelo, nombre, opciones = {}) => {
    const { attributes, order = [['id', 'ASC']], mensajeEnUso } = opciones;

    const buscarOFallar = async (id) => {
        const registro = await Modelo.findByPk(id);
        if (!registro) throw errorHttp(404, `${nombre} no encontrado(a)`);
        return registro;
    };

    return {
        // GET /recurso
        listar: async (req, res) => {
            const registros = await Modelo.findAll({ attributes, order });
            res.json(registros);
        },

        // GET /recurso/:id
        obtener: async (req, res) => {
            res.json(await buscarOFallar(req.params.id));
        },

        // POST /recurso
        crear: async (req, res) => {
            const nuevo = await Modelo.create(req.body);
            res.status(201).json(nuevo);
        },

        // PUT /recurso/:id
        actualizar: async (req, res) => {
            const registro = await buscarOFallar(req.params.id);
            await registro.update(req.body);
            res.json(registro);
        },

        // DELETE /recurso/:id
        eliminar: async (req, res) => {
            const registro = await buscarOFallar(req.params.id);
            try {
                await registro.destroy();
            } catch (error) {
                // La llave foránea (RESTRICT) impide borrar registros en uso
                if (error.name === 'SequelizeForeignKeyConstraintError' && mensajeEnUso) {
                    throw errorHttp(409, mensajeEnUso);
                }
                throw error;
            }
            res.json({ message: `${nombre} eliminado(a)` });
        }
    };
};

module.exports = crudController;

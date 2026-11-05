// Crea TODAS las tablas desde cero y carga datos de prueba.
// Uso: npm run seed   (¡borra los datos existentes!)
const { sequelize, Categoria, Proveedor, Usuario, Producto } = require('./models');
const { registrarMovimiento } = require('./services/inventarioService');

// Fecha de hace N días a una hora concreta (para que el Kardex tenga historial)
const haceDias = (dias, hora, minuto = 0) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    fecha.setHours(hora, minuto, 0, 0);
    return fecha;
};

const seed = async () => {
    // 1) Recrear las tablas (se desactivan las FK un momento para poder borrarlas)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tablas creadas: categorias, proveedores, usuarios, productos, movimientos');

    // 2) Catálogos
    const [perifericos, laptops, monitores, impresoras, componentes] = await Categoria.bulkCreate([
        { nombre: 'Periféricos', descripcion: 'Dispositivos de entrada y salida como mouse, teclados y auriculares.' },
        { nombre: 'Laptops y PC', descripcion: 'Computadoras portátiles, de escritorio y todo en uno.' },
        { nombre: 'Monitores', descripcion: 'Pantallas y monitores para oficina y gaming.' },
        { nombre: 'Impresoras', descripcion: 'Equipos de impresión, multifuncionales y suministros de tinta.' },
        { nombre: 'Componentes', descripcion: 'Partes internas como memorias RAM, discos sólidos y placas.' }
    ]);

    const [logitech, techImport, distNorte, globalElec, asus] = await Proveedor.bulkCreate([
        { razon_social: 'Logitech Perú S.A.C.', contacto: 'Carlos Mendoza', telefono: '987654321', email: 'ventas@logitech.pe' },
        { razon_social: 'Tech Import S.A.', contacto: 'Ana Torres', telefono: '912345678', email: 'atorres@techimport.com' },
        { razon_social: 'Distribuidora del Norte', contacto: 'Luis Quispe', telefono: '945876213', email: 'lquispe@distnorte.pe' },
        { razon_social: 'Global Electrónicos', contacto: 'Marta Gómez', telefono: '981234567', email: 'mgomez@globalelec.com' },
        { razon_social: 'Asus Latinoamérica', contacto: 'Javier Soto', telefono: '955432109', email: 'jsoto@asus.la' }
    ]);

    // individualHooks: true → se ejecuta el hook que encripta cada contraseña
    const [admin, almacenero1, almacenero2] = await Usuario.bulkCreate([
        { nombre: 'Mayra Mallqui', email: 'mmallqui@inventario.pe', password: 'admin123', rol: 'Administrador' },
        { nombre: 'Luis Ramírez', email: 'lramirez@inventario.pe', password: 'almacen123', rol: 'Almacenero' },
        { nombre: 'Sofía Rojas', email: 'srojas@inventario.pe', password: 'almacen123', rol: 'Almacenero' },
        { nombre: 'Carlos Vega', email: 'cvega@inventario.pe', password: 'super123', rol: 'Supervisor', activo: false }
    ], { individualHooks: true });

    // 3) Productos (todos empiezan con stock 0: el stock entra por el Kardex)
    const productos = await Producto.bulkCreate([
        { nombre: 'Mouse Logitech G203', descripcion: 'Mouse gamer RGB 8000 DPI', precio: 85, stock_minimo: 5, categoria_id: perifericos.id, proveedor_id: logitech.id },
        { nombre: 'Teclado Mecánico Redragon', descripcion: 'Teclado mecánico switches azules', precio: 180, stock_minimo: 5, categoria_id: perifericos.id, proveedor_id: techImport.id },
        { nombre: 'Audífonos HyperX Cloud', descripcion: 'Audífonos gamer con micrófono', precio: 249.9, stock_minimo: 4, categoria_id: perifericos.id, proveedor_id: globalElec.id },
        { nombre: 'Laptop ASUS TUF Gaming', descripcion: 'Ryzen 7, 16 GB RAM, RTX 4050', precio: 3499, stock_minimo: 3, categoria_id: laptops.id, proveedor_id: asus.id },
        { nombre: 'Laptop Lenovo IdeaPad 3', descripcion: 'Core i5, 8 GB RAM, SSD 512 GB', precio: 2199, stock_minimo: 3, categoria_id: laptops.id, proveedor_id: distNorte.id },
        { nombre: 'Monitor LG 24" IPS', descripcion: 'Full HD 75 Hz', precio: 550, stock_minimo: 4, categoria_id: monitores.id, proveedor_id: globalElec.id },
        { nombre: 'Monitor Samsung 27" Curvo', descripcion: 'Full HD 75 Hz curvo', precio: 799, stock_minimo: 3, categoria_id: monitores.id, proveedor_id: techImport.id },
        { nombre: 'Impresora HP Ink Tank 415', descripcion: 'Multifuncional con WiFi', precio: 650, stock_minimo: 4, categoria_id: impresoras.id, proveedor_id: distNorte.id },
        { nombre: 'Memoria RAM Kingston 16 GB', descripcion: 'DDR4 3200 MHz', precio: 189, stock_minimo: 6, categoria_id: componentes.id, proveedor_id: techImport.id },
        { nombre: 'SSD Kingston NV2 1 TB', descripcion: 'NVMe M.2 PCIe 4.0', precio: 259, stock_minimo: 5, categoria_id: componentes.id, proveedor_id: null }
    ]);
    const [mouse, teclado, audifonos, asusTuf, lenovo, lg, samsung, hp, ram, ssd] = productos;

    // 4) Movimientos del Kardex (cada uno en su propia transacción, como en la API real)
    const movimientos = [
        [mouse, 'Entrada', 20, admin, 7, 9, 'Compra inicial'],
        [teclado, 'Entrada', 10, admin, 7, 9, 'Compra inicial'],
        [audifonos, 'Entrada', 8, admin, 7, 10, 'Compra inicial'],
        [asusTuf, 'Entrada', 6, admin, 7, 10, 'Compra inicial'],
        [lenovo, 'Entrada', 7, admin, 7, 11, 'Compra inicial'],
        [lg, 'Entrada', 15, almacenero1, 6, 9, 'Compra inicial'],
        [samsung, 'Entrada', 5, almacenero1, 6, 9, 'Compra inicial'],
        [hp, 'Entrada', 6, almacenero1, 6, 10, 'Compra inicial'],
        [ram, 'Entrada', 12, almacenero2, 6, 11, 'Compra inicial'],
        [ssd, 'Entrada', 9, almacenero2, 6, 11, 'Compra inicial'],
        [teclado, 'Salida', 4, almacenero1, 5, 15, 'Venta tienda'],
        [asusTuf, 'Salida', 2, admin, 4, 13, 'Venta corporativa'],
        [hp, 'Salida', 3, almacenero2, 4, 16, 'Venta tienda'],
        [audifonos, 'Ajuste', -1, admin, 3, 18, 'Unidad dañada en almacén'],
        [ram, 'Salida', 8, almacenero1, 3, 12, 'Pedido de ensamblaje'],
        [mouse, 'Entrada', 5, almacenero1, 2, 10, 'Reposición'],
        [samsung, 'Salida', 3, almacenero2, 2, 17, 'Venta tienda'],
        [lenovo, 'Salida', 2, admin, 1, 9, 'Venta tienda'],
        [mouse, 'Salida', 2, almacenero2, 1, 11, 'Venta tienda']
    ];

    for (const [producto, tipo, cantidad, usuario, dias, hora, obs] of movimientos) {
        await sequelize.transaction((t) => registrarMovimiento({
            producto_id: producto.id,
            usuario_id: usuario.id,
            tipo_movimiento: tipo,
            cantidad,
            fecha_hora: haceDias(dias, hora, (producto.id * 7) % 60),
            observaciones: obs
        }, t));
    }

    console.log(`Datos de prueba cargados: 5 categorías, 5 proveedores, 4 usuarios, ${productos.length} productos, ${movimientos.length} movimientos.`);
};

seed()
    .catch((error) => console.error('Error al cargar los datos:', error))
    .finally(() => sequelize.close());

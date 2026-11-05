# appApi – Backend del Sistema de Inventario

API REST con **Node.js + Express 5 + Sequelize + MySQL** (Laboratorios #7, #8 y #9 – Seminario IA 502, SENATI).

## Instalación
```bash
npm install
cp .env.example .env      # completar credenciales de MySQL
npm run seed              # crea las tablas y carga datos de prueba (¡borra los datos!)
npm run dev               # http://localhost:3006
```

## Endpoints (prefijo `/api`)
| Recurso | Rutas |
|---|---|
| Dashboard | `GET /dashboard` |
| Categorías | `GET/POST /categorias` · `GET/PUT/DELETE /categorias/:id` |
| Proveedores | `GET/POST /proveedores` · `GET/PUT/DELETE /proveedores/:id` |
| Usuarios | `GET/POST /usuarios` · `GET/PUT /usuarios/:id` · `PATCH /usuarios/:id/estado` |
| Productos | `GET/POST /productos` · `GET/PUT/DELETE /productos/:id` |
| Movimientos | `GET/POST /movimientos` · `GET /movimientos/:id` · `PATCH /movimientos/:id/anular` |

Frontend: https://github.com/MayraFab/appInventario

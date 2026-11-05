# appApi – Backend del Sistema de Inventario

API REST con **Node.js + Express 5 + Sequelize + MySQL**, protegida con **JWT, bcrypt, helmet, CORS y rate limit**
(Laboratorios #7 al #10 – Seminario IA 502, SENATI).

## Instalación
```bash
npm install
cp .env.example .env      # completar credenciales y JWT_SECRET
npm run seed              # crea las tablas y datos de prueba (¡borra los datos!)
npm run dev               # http://localhost:3006
```

## Seguridad
| Medida | Implementación |
|---|---|
| Contraseñas | bcrypt (hash + salt), nunca se devuelven |
| Autenticación | JWT (`Authorization: Bearer <token>`), expira en 2 h |
| Autorización | Roles: Administrador, Almacenero, Supervisor |
| XSS / Clickjacking | helmet (CSP, X-Frame-Options, nosniff) |
| CORS | solo `CORS_ORIGIN` (frontend) |
| Fuerza bruta / DoS | 300 peticiones/15 min por IP · login: 5 intentos fallidos/15 min |
| SQL Injection | consultas parametrizadas de Sequelize |

## Endpoints (prefijo `/api`)
| Recurso | Rutas | Acceso |
|---|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/perfil` | público / token |
| Dashboard | `GET /dashboard` | token |
| Categorías, Proveedores, Productos | `GET` · `POST` · `PUT` · `DELETE` | leer: todos · crear/editar: Admin, Almacenero · eliminar: Admin |
| Movimientos | `GET` · `POST` · `PATCH /:id/anular` | registrar: Admin, Almacenero · anular: Admin, Supervisor |
| Usuarios | `GET` · `POST` · `PUT` · `PATCH /:id/estado` | Admin |

Frontend: https://github.com/MayraFab/appInventario

# Plataforma DPO — Protección de Datos

Plataforma para la gestión integral de protección de datos: empresas y
usuarios, consentimientos, derechos ARCO, brechas de seguridad, plazos de
retención, canal ético, madurez, formación, RAT (Registro de Actividades de
Tratamiento), plantillas de contratos, auditorías y evidencias.

Arquitectura de **microservicios** en el backend y **módulos frontend
independientes** desplegables por separado, de forma que actualizar un
módulo no afecta a los demás.

## Índice

- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Puesta en marcha local](#puesta-en-marcha-local)
- [Base de datos PostgreSQL en Hostinger](#base-de-datos-postgresql-en-hostinger)
- [Despliegue con Docker Compose](#despliegue-con-docker-compose)
- [Añadir un módulo nuevo](#añadir-un-módulo-nuevo)
- [Variables de entorno](#variables-de-entorno)
- [Estado del proyecto](#estado-del-proyecto)

## Arquitectura

### Backend: microservicios (NestJS + TypeORM + PostgreSQL)

| Servicio | Puerto | Responsabilidad | Ruta en el Gateway |
|---|---|---|---|
| `gateway-api` | 3000 | Reverse proxy + agregador de salud | `/status`, `/health` |
| `auth-service` | 3001 | Empresas, usuarios, login/JWT | `/api/auth`, `/api/empresas`, `/api/usuarios` |
| `consent-service` | 3002 | Titulares y consentimientos | `/api/titulares`, `/api/consentimientos` |
| `rat-service` | 3003 | Registro de Actividades de Tratamiento | `/api/actividades` |
| `arco-service` | 3004 | Derechos ARCO | `/api/solicitudes-arco` |
| `breach-service` | 3005 | Brechas de seguridad | `/api/brechas` |
| `retention-service` | 3006 | Plazos de retención | `/api/politicas-retencion` |
| `ethics-service` | 3007 | Canal ético / denuncias | `/api/denuncias` |
| `maturity-service` | 3008 | Evaluaciones de madurez | `/api/evaluaciones-madurez` |
| `training-service` | 3009 | Formación | `/api/formaciones` |
| `contracts-service` | 3010 | Plantillas de contratos | `/api/plantillas-contrato`, `/api/contratos-asignados` |
| `audit-service` | 3011 | Auditorías y hallazgos | `/api/auditorias` |
| `evidence-service` | 3012 | Evidencias documentales | `/api/evidencias` |

Cada microservicio:

- Es una aplicación NestJS **independiente**, con su propio `package.json`,
  `main.ts` y ciclo de despliegue — se puede actualizar y reiniciar sin
  tocar los demás.
- Se conecta a la **misma base de datos PostgreSQL física** pero a un
  **esquema propio** (`auth`, `consent`, `rat`, `arco`, …). Este patrón
  *schema-per-service* da aislamiento lógico de datos por dominio sin
  depender de múltiples bases de datos físicas — importante en hosting
  administrado (Hostinger) donde el número de bases de datos suele estar
  limitado.
- Valida el JWT **de forma independiente** (mismo `JWT_SECRET`
  compartido), sin depender de una llamada de red al `auth-service` en cada
  petición — así cada servicio sigue funcionando de forma autónoma incluso
  si se le llama directamente, sin pasar por el gateway.
- Expone `GET /health` para chequeos de salud.

El `gateway-api` es un **proxy transparente** (no valida JWT, no parsea el
body): reenvía cada request al microservicio correspondiente según su
prefijo (`/api/<recurso>` → servicio). Ver la tabla de rutas en
`services/gateway-api/src/proxy/proxy.config.ts`. Añadir un nuevo backend
es: crear el servicio, darlo de alta en esa tabla — no requiere tocar el
resto de servicios.

### Frontend: módulos independientes (React + Vite + Module Federation)

```
frontend/
├── shell/                      # Host: login, layout, navegación, registro de módulos
└── modules/
    ├── companies-users/        # Completo: empresas y usuarios
    ├── consents/                # Completo: titulares y consentimientos
    ├── rat/                      # Completo: actividades de tratamiento
    ├── arco/                     # Conectado a su API, listo para ampliar
    ├── breaches/
    ├── retention/
    ├── ethics-channel/
    ├── maturity/
    ├── training/
    ├── contracts/
    ├── audit/
    └── evidence/
```

Cada módulo es una aplicación Vite + React **independiente** que se
compila y expone vía [Module Federation](https://github.com/originjs/vite-plugin-federation)
(`remoteEntry.js`). El `shell` los carga en tiempo de ejecución con
`React.lazy` + `Suspense`, envueltos en un `ModuleBoundary` (error boundary
propio) — si un módulo falla al cargar o lanza un error, **solo ese
módulo se degrada**; el resto de la plataforma sigue funcionando.

Cada módulo:

- Tiene su propio `package.json`, se compila y despliega por separado
  (contenedor Nginx propio en `docker-compose.yml`).
- No importa código de otros módulos — solo llama al API Gateway por HTTP.
- Lee el JWT de `localStorage` (compartido por el shell tras el login).

> **Nota sobre Module Federation con Vite**: `@originjs/vite-plugin-federation`
> genera el `remoteEntry.js` en el **build** de producción. Durante
> desarrollo activo de un módulo, usa `npm run dev` dentro de esa carpeta
> (aislado). Para probar la composición completa (shell + módulos remotos)
> usa `npm run build && npm run preview` en cada uno, o `docker-compose up`.

## Estructura del repositorio

```
.
├── db/                     # SQL: esquemas + migraciones por dominio
│   ├── init/               # Extensiones + creación de esquemas
│   └── migrations/<schema>/*.sql
├── scripts/
│   └── migrate.js          # Aplica db/init y db/migrations/* contra PostgreSQL
├── shared/
│   └── common/             # @dpo/common: guards JWT/roles, health, paginación, TypeORM config
├── services/               # 12 microservicios + gateway-api (NestJS)
├── frontend/
│   ├── shell/               # Host (React + Module Federation)
│   └── modules/              # 12 módulos independientes
├── docker/                 # Dockerfiles genéricos (backend/frontend) + nginx.conf
├── docker-compose.yml       # Orquesta BD + 13 servicios backend + 13 frontend
└── .env.example
```

## Requisitos

- Node.js ≥ 20 y npm ≥ 10
- PostgreSQL ≥ 14 (local para desarrollo, o el de Hostinger)
- Docker + Docker Compose (opcional, para levantar todo junto)

## Puesta en marcha local

```bash
# 1. Instalar dependencias de todo el monorepo (npm workspaces)
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# edita .env con tus datos de PostgreSQL (local u Hostinger)

# 3. Crear el esquema de base de datos (ver sección siguiente)
npm run db:migrate

# 4. Compilar y levantar un servicio backend, por ejemplo auth-service
npm run build --workspace=services/auth-service
node services/auth-service/dist/main.js

# 5. Levantar el gateway (en otra terminal)
npm run build --workspace=services/gateway-api
node services/gateway-api/dist/main.js

# 6. Levantar el shell y algún módulo (en otras terminales)
npm run build --workspace=frontend/modules/companies-users
npm run preview --workspace=frontend/modules/companies-users
npm run build --workspace=frontend/shell
npm run preview --workspace=frontend/shell
```

Abre `http://localhost:5173`. Regístrate con `POST /api/auth/register`
(ver ejemplo abajo) o usa el formulario de login tras crear un usuario.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Admin","email":"admin@empresa.test","password":"password123"}'
```

La forma más simple de levantar **todo** (BD + 13 backends + 13 frontends)
es con Docker Compose — ver más abajo.

## Base de datos PostgreSQL en Hostinger

1. En **hPanel → Bases de datos → PostgreSQL**, crea una base de datos
   (por ejemplo `dpo_platform`) y un usuario con permisos sobre ella. Anota
   el **host**, **puerto**, **nombre de la base**, **usuario** y
   **contraseña** que te asigna Hostinger.
2. Copia esos valores a tu `.env` (o exporta `DATABASE_URL`):
   ```
   POSTGRES_HOST=srv-xxxx.hstgr.io
   POSTGRES_PORT=5432
   POSTGRES_DB=dpo_platform
   POSTGRES_USER=tu_usuario
   POSTGRES_PASSWORD=tu_password
   POSTGRES_SSL=true
   ```
3. Ejecuta las migraciones desde tu máquina (necesitas acceso de red al
   host de Hostinger; si el plan restringe conexiones externas, hazlo
   desde una sesión SSH del propio hosting si está disponible, o
   temporalmente permite tu IP en el panel de la base de datos):
   ```bash
   npm run db:migrate
   ```
   Esto crea los 12 esquemas (`auth`, `consent`, `rat`, …) y todas sus
   tablas, tipos `ENUM` e índices — ver `db/init/` y `db/migrations/`.
4. Si tu usuario de PostgreSQL **no tiene permiso para crear extensiones**
   (`CREATE EXTENSION`), pide al soporte de Hostinger que habilite
   `pgcrypto` en la base, o ejecuta ese `CREATE EXTENSION IF NOT EXISTS
   pgcrypto;` desde el panel de administración de la base de datos antes
   de correr las migraciones.
5. Alternativa sin acceso de red directo: copia el contenido de
   `db/init/00-extensions-and-schemas.sql` y de cada
   `db/migrations/<schema>/001_init.sql` (en ese orden) y pégalo en la
   consola SQL / phpPgAdmin / Adminer que ofrezca Hostinger.

Cada microservicio, al desplegarse, solo necesita las mismas variables
`POSTGRES_*` (o `DATABASE_URL`) apuntando a esa base — todos comparten la
misma base física, cada uno opera solo sobre su propio esquema.

## Despliegue con Docker Compose

```bash
cp .env.example .env   # ajusta credenciales y PUBLIC_HOST
docker compose up --build -d
docker compose run --rm migrate
```

Esto levanta:
- `postgres` — en un VPS (con acceso root, como el de Hostinger) se usa
  este mismo contenedor como base de datos de producción, con sus datos en
  un volumen Docker persistente; no hace falta crear nada en el panel de
  Hostinger. Si en cambio usas un PostgreSQL administrado aparte, omite
  este servicio del compose y apunta `POSTGRES_HOST` a ese host.
- `migrate` (aplica el esquema una vez),
- los 12 microservicios + `gateway-api` (puertos 3000-3012),
- el `shell` y los 12 módulos frontend, cada uno en su propio contenedor
  Nginx (puertos 5173, 5175-5186).

La variable `PUBLIC_HOST` (IP o dominio del servidor) se usa **solo** al
compilar el `shell`: Vite la incrusta en el bundle del navegador, así que
debe ser una dirección alcanzable por el usuario final — nunca `localhost`
ni el nombre de un contenedor. Ver **[DEPLOY.md](./DEPLOY.md)** para la
guía completa, paso a paso, de despliegue en un VPS de Hostinger por IP
pública (sin dominio).

## Añadir un módulo nuevo

**Backend:**
1. Duplica la estructura de un servicio existente (p. ej.
   `services/arco-service`) bajo `services/<nuevo>-service`.
2. Crea su esquema y tablas en `db/migrations/<nuevo>/001_init.sql`.
3. Da de alta la ruta en `services/gateway-api/src/proxy/proxy.config.ts`.
4. Añade el servicio (y sus variables `*_SERVICE_URL` / `*_SERVICE_PORT`)
   en `.env.example` y `docker-compose.yml`.

**Frontend:**
1. Duplica un módulo existente bajo `frontend/modules/<nuevo>`, cambia el
   `name` en su `vite.config.ts` (federation) y su puerto.
2. Añade el remoto en `frontend/shell/vite.config.ts` (`remotes`) y una
   entrada en `frontend/shell/src/routes/moduleRegistry.tsx` +
   `src/remotes.d.ts`.
3. Añade su contenedor en `docker-compose.yml`.

Ninguno de estos pasos requiere modificar el código de los módulos o
servicios existentes.

## Variables de entorno

Ver `.env.example` (raíz) para el backend y
`frontend/shell/.env.example` para el frontend. Resumen:

- `POSTGRES_*` / `DATABASE_URL` — conexión a PostgreSQL (Hostinger o local)
- `JWT_SECRET`, `JWT_EXPIRES_IN` — compartidos por **todos** los
  microservicios (deben coincidir para que la verificación de JWT
  funcione entre servicios)
- `<SERVICIO>_PORT` — puerto de cada microservicio
- `<SERVICIO>_URL` — usadas solo por `gateway-api` para enrutar
- `VITE_API_BASE_URL`, `VITE_REMOTE_*` — usadas por el frontend en
  tiempo de build

## Estado del proyecto

**Completo y probado de extremo a extremo** (build + arranque contra
PostgreSQL real + pruebas funcionales vía HTTP/navegador):

- Arquitectura completa: 12 microservicios + gateway, 12 módulos frontend + shell.
- Esquema de base de datos completo (12 dominios) con migraciones SQL.
- `auth-service`, `consent-service`, `rat-service`: CRUD completo, login/JWT, roles.
- `companies-users`, `consents`, `rat`: módulos frontend completos con formularios y tablas.
- Los 9 microservicios restantes: CRUD completo sobre su entidad principal
  (algunos con sub-recursos anidados: hallazgos de auditoría, participantes
  de formación, contratos asignados a plantillas, dominios de madurez).
- Los 9 módulos frontend restantes: ya conectados a su API (listan datos
  reales), listos para ampliarse con formularios de alta/edición siguiendo
  el mismo patrón de los módulos completos.

**Pendiente para producción** (siguientes iteraciones sugeridas):

- Formularios de alta/edición en los 9 módulos frontend restantes.
- Subida real de archivos para `evidence-service` (hoy se registra la URL
  de almacenamiento; falta integrar un storage — S3-compatible, o el
  storage de Hostinger).
- Tests automatizados (unitarios/e2e).
- Endurecer políticas de roles por endpoint según el modelo de permisos
  definitivo del negocio.
- CI/CD hacia el servidor de Hostinger.

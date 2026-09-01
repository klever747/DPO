# Despliegue en un VPS de Hostinger (por IP, con Docker)

Guía paso a paso para dejar la Plataforma DPO corriendo en tu VPS de
Hostinger, accediendo por la IP pública del servidor (sin dominio todavía).
Todo se ejecuta **en el VPS, por SSH** — copia y pega los comandos tal cual.

> Como tienes un **VPS** (acceso root completo), **no necesitas** crear una
> base de datos en la sección "Bases de datos" de hPanel — esa opción es
> para hosting compartido. Aquí PostgreSQL corre como un contenedor más,
> ya definido en `docker-compose.yml`, con sus datos guardados en un volumen
> Docker persistente (sobrevive a reinicios y actualizaciones).

## 0. Datos que necesitas antes de empezar

- La **IP pública** de tu VPS (la ves en hPanel → VPS → Overview).
- Usuario y contraseña (o clave SSH) para conectarte — Hostinger te los
  muestra al crear el VPS, o los defines tú.

## 1. Conéctate por SSH

Desde tu computadora:

```bash
ssh root@TU_IP_DEL_VPS
```

(La primera vez te pedirá confirmar la huella del servidor — escribe `yes`.)

## 2. Instala Docker y prepara el firewall

Ya en el VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/klever747/DPO/claude/data-protection-web-app-us5y7c/scripts/vps-setup.sh | bash
```

Esto instala Docker + Docker Compose, y abre en el firewall (`ufw`) los
puertos que la plataforma necesita: `3000` (API), `5173` (app), `5175-5186`
(módulos).

> Si en hPanel tu VPS tiene además un **Firewall de Hostinger** (a nivel de
> panel, separado de `ufw`), entra a **hPanel → VPS → Firewall** y agrega
> reglas para permitir tráfico entrante TCP en esos mismos puertos
> (`3000`, `5173`, `5175-5186`) y `22` para SSH. Sin este paso, aunque
> `ufw` los permita, Hostinger puede seguir bloqueándolos por fuera.

## 3. Clona el repositorio

```bash
mkdir -p /opt/dpo && cd /opt/dpo
git clone https://github.com/klever747/DPO.git .
git checkout claude/data-protection-web-app-us5y7c
```

> Nota: mientras el Pull Request no esté fusionado a `main`, el código vive
> en la rama `claude/data-protection-web-app-us5y7c` — por eso el
> `checkout` explícito. Una vez fusionado, bastará con `git clone` normal.

## 4. Configura las variables de entorno

```bash
cp .env.example .env
nano .env
```

Como mínimo, cambia estos 4 valores (los demás puedes dejarlos por defecto):

```dotenv
POSTGRES_DB=dpo_platform
POSTGRES_USER=dpo_admin
POSTGRES_PASSWORD=PON_AQUI_UNA_CONTRASEÑA_FUERTE
JWT_SECRET=PON_AQUI_OTRA_CADENA_LARGA_Y_ALEATORIA
PUBLIC_HOST=TU_IP_DEL_VPS
```

- `POSTGRES_*`: son las credenciales **que tú eliges** para el contenedor
  de PostgreSQL que se va a crear — no existen todavía, se crean solas la
  primera vez que arranca el contenedor.
- `PUBLIC_HOST`: la misma IP pública del paso 0 (sin `http://`, sin
  puerto). El frontend la necesita para saber a qué dirección llamar desde
  el navegador del usuario final.
- `JWT_SECRET`: genera uno rápido con `openssl rand -hex 32` y pégalo.

Guarda con `Ctrl+O`, Enter, y sal con `Ctrl+X`.

## 5. Levanta todo

```bash
docker compose up --build -d
```

La primera vez tardará varios minutos (compila 12 microservicios + 12
módulos frontend + el shell). Cuando termine:

```bash
docker compose ps
```

Todos los servicios deben verse `running` (excepto `migrate`, que corre una
vez y termina — eso es normal).

## 6. Aplica las migraciones de la base de datos

```bash
docker compose run --rm migrate
```

Deberías ver "Migraciones completadas: 13 archivo(s) aplicados." Esto crea
los 12 esquemas (`auth`, `consent`, `rat`, …) con todas sus tablas.

## 7. Verifica que todo responde

```bash
curl http://localhost:3000/status
```

Deberías ver `"gateway":"ok"` y los 12 microservicios en `"reachable":true`.

Desde tu navegador (en tu computadora, no en el VPS), abre:

```
http://TU_IP_DEL_VPS:5173
```

Deberías ver la pantalla de login de la Plataforma DPO.

## 8. Crea tu primer usuario administrador

```bash
curl -X POST http://TU_IP_DEL_VPS:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Admin","email":"admin@tuempresa.com","password":"unaClaveSegura123"}'
```

Ahora entra a `http://TU_IP_DEL_VPS:5173` e inicia sesión con ese email y
contraseña.

## Actualizar la app más adelante

```bash
cd /opt/dpo
git pull
docker compose up --build -d
```

Docker solo reconstruye las imágenes de los servicios que cambiaron.

## Advertencia sobre seguridad (sin dominio/SSL todavía)

Mientras accedas solo por IP y HTTP (sin dominio), el tráfico —incluyendo
contraseñas y tokens— **viaja sin cifrar**. Es aceptable para probar, pero
antes de usarlo con datos reales de personas, se recomienda:

1. Apuntar un dominio (o subdominio) a la IP del VPS.
2. Poner un Nginx (o Caddy) como proxy inverso delante de los puertos
   `3000`/`5173`/`5175-5186`, sirviendo todo bajo `https://tu-dominio.com`
   con un certificado gratuito de Let's Encrypt (`certbot`).

Esto es un paso de "endurecimiento" posterior — se puede añadir sin tocar
el código de la aplicación, solo configuración de Nginx.

## Solución de problemas

- **`docker compose up` falla por puertos ocupados**: revisa que nada más
  esté usando esos puertos (`ss -ltnp`).
- **El navegador no carga nada en `:5173`**: revisa el firewall de
  Hostinger (paso 2) — es la causa más común.
- **Los módulos remotos no cargan (pantalla en blanco o error de módulo)**:
  confirma que `PUBLIC_HOST` en `.env` es correcto y vuelve a construir
  solo el shell: `docker compose up --build -d shell`.
- **`docker compose run --rm migrate` falla con error de conexión**:
  espera unos segundos a que `postgres` esté `healthy`
  (`docker compose ps`) y reinténtalo.

-- ==========================================================================
-- Inicialización de la base de datos de la Plataforma DPO
-- Un único servidor PostgreSQL (ej. Hostinger managed Postgres), un esquema
-- por microservicio. Esto permite aislamiento lógico de datos por dominio
-- sin depender de múltiples bases de datos físicas (limitación habitual en
-- hosting compartido/administrado).
-- ==========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS consent;
CREATE SCHEMA IF NOT EXISTS rat;
CREATE SCHEMA IF NOT EXISTS arco;
CREATE SCHEMA IF NOT EXISTS breach;
CREATE SCHEMA IF NOT EXISTS retention;
CREATE SCHEMA IF NOT EXISTS ethics;
CREATE SCHEMA IF NOT EXISTS maturity;
CREATE SCHEMA IF NOT EXISTS training;
CREATE SCHEMA IF NOT EXISTS contracts;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS evidence;

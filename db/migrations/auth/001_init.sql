-- Esquema auth: empresas y usuarios
SET search_path TO auth;

CREATE TABLE IF NOT EXISTS empresas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              VARCHAR(200) NOT NULL,
    nif                 VARCHAR(50) UNIQUE,
    sector              VARCHAR(150),
    direccion           VARCHAR(300),
    pais                VARCHAR(100),
    tamano              VARCHAR(50), -- micro, pequena, mediana, grande
    representante_legal VARCHAR(200),
    dpo_nombre          VARCHAR(200),
    dpo_email           VARCHAR(200),
    activo              BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE auth.rol_usuario AS ENUM (
    'super_admin',   -- administra la plataforma
    'admin_empresa', -- administra la cuenta de una empresa
    'dpo',           -- delegado de protección de datos
    'gestor',        -- gestiona módulos operativos
    'auditor',       -- solo lectura + auditoría
    'empleado'       -- acceso limitado (ej. formación)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    apellidos       VARCHAR(150),
    email           VARCHAR(200) NOT NULL UNIQUE,
    password_hash   VARCHAR(200) NOT NULL,
    rol             auth.rol_usuario NOT NULL DEFAULT 'empleado',
    activo          BOOLEAN NOT NULL DEFAULT true,
    ultimo_acceso   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);

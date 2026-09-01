-- Esquema ethics: canal ético / denuncias
SET search_path TO ethics;

CREATE TYPE ethics.categoria_denuncia AS ENUM ('fraude', 'acoso', 'corrupcion', 'proteccion_datos', 'discriminacion', 'otro');
CREATE TYPE ethics.estado_denuncia AS ENUM ('recibida', 'en_investigacion', 'resuelta', 'archivada');

CREATE TABLE IF NOT EXISTS denuncias_canal_etico (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id            UUID NOT NULL,
    codigo_seguimiento    VARCHAR(50) NOT NULL UNIQUE,
    categoria             ethics.categoria_denuncia NOT NULL,
    descripcion           TEXT NOT NULL,
    denunciante_anonimo   BOOLEAN NOT NULL DEFAULT true,
    denunciante_contacto  VARCHAR(200),
    estado                ethics.estado_denuncia NOT NULL DEFAULT 'recibida',
    fecha_recepcion       TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre          TIMESTAMPTZ,
    resolucion            TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ethics_empresa ON denuncias_canal_etico(empresa_id);

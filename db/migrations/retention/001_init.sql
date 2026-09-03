-- Esquema retention: plazos de retención / conservación de datos
SET search_path TO retention;

CREATE TYPE retention.unidad_plazo AS ENUM ('dias', 'meses', 'anios');
CREATE TYPE retention.accion_vencimiento AS ENUM ('eliminacion', 'anonimizacion', 'archivado');

CREATE TABLE IF NOT EXISTS politicas_retencion (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id              UUID NOT NULL,
    categoria_datos         VARCHAR(250) NOT NULL,
    base_legal_retencion    VARCHAR(300),
    plazo_valor             INTEGER NOT NULL,
    plazo_unidad            retention.unidad_plazo NOT NULL DEFAULT 'anios',
    criterio_inicio_computo VARCHAR(300),
    accion_al_vencer        retention.accion_vencimiento NOT NULL DEFAULT 'eliminacion',
    activo                  BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retention_empresa ON politicas_retencion(empresa_id);

-- Esquema breach: brechas de seguridad
SET search_path TO breach;

CREATE TYPE breach.nivel_riesgo AS ENUM ('bajo', 'medio', 'alto', 'critico');
CREATE TYPE breach.estado_brecha AS ENUM ('abierta', 'en_investigacion', 'contenida', 'cerrada');

CREATE TABLE IF NOT EXISTS brechas_seguridad (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id                  UUID NOT NULL,
    titulo                      VARCHAR(250) NOT NULL,
    descripcion                 TEXT NOT NULL,
    categorias_datos_afectados  TEXT[] NOT NULL DEFAULT '{}',
    num_afectados               INTEGER,
    nivel_riesgo                breach.nivel_riesgo NOT NULL DEFAULT 'medio',
    fecha_deteccion             TIMESTAMPTZ NOT NULL,
    fecha_notificacion_autoridad TIMESTAMPTZ,
    fecha_notificacion_afectados TIMESTAMPTZ,
    notificada_autoridad        BOOLEAN NOT NULL DEFAULT false,
    notificada_afectados        BOOLEAN NOT NULL DEFAULT false,
    medidas_adoptadas           TEXT,
    estado                      breach.estado_brecha NOT NULL DEFAULT 'abierta',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_breach_empresa ON brechas_seguridad(empresa_id);

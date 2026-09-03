-- Esquema rat: Registro de Actividades de Tratamiento
SET search_path TO rat;

CREATE TYPE rat.estado_actividad AS ENUM ('borrador', 'vigente', 'obsoleto');

CREATE TABLE IF NOT EXISTS actividades_tratamiento (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id                      UUID NOT NULL,
    nombre_actividad                VARCHAR(250) NOT NULL,
    finalidad                       TEXT NOT NULL,
    base_legal                      VARCHAR(250) NOT NULL,
    categorias_datos                TEXT[] NOT NULL DEFAULT '{}',
    categorias_titulares            TEXT[] NOT NULL DEFAULT '{}',
    destinatarios                   TEXT[] NOT NULL DEFAULT '{}',
    transferencias_internacionales  BOOLEAN NOT NULL DEFAULT false,
    paises_destino                  TEXT[] NOT NULL DEFAULT '{}',
    garantias_transferencia         VARCHAR(300),
    plazo_conservacion              VARCHAR(200),
    medidas_seguridad               TEXT,
    responsable_tratamiento         VARCHAR(200),
    encargado_tratamiento           VARCHAR(200),
    fecha_evaluacion                DATE,
    estado                          rat.estado_actividad NOT NULL DEFAULT 'borrador',
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rat_empresa ON actividades_tratamiento(empresa_id);

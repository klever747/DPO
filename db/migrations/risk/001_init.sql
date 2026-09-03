CREATE SCHEMA IF NOT EXISTS risk;
SET search_path TO risk;

CREATE TYPE risk.estado_riesgo AS ENUM ('pendiente', 'en_tratamiento', 'mitigado', 'aceptado');
CREATE TYPE risk.nivel_riesgo AS ENUM ('bajo', 'medio', 'alto', 'critico');

CREATE TABLE IF NOT EXISTS evaluaciones_riesgo (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id                UUID NOT NULL,
    actividad_id              UUID,
    actividad_nombre          VARCHAR(250) NOT NULL,
    descripcion_riesgo        TEXT NOT NULL,
    probabilidad              SMALLINT NOT NULL CHECK (probabilidad BETWEEN 1 AND 5),
    impacto                   SMALLINT NOT NULL CHECK (impacto BETWEEN 1 AND 5),
    nivel_riesgo              risk.nivel_riesgo NOT NULL,
    medidas_mitigacion        TEXT,
    requiere_consulta_previa  BOOLEAN NOT NULL DEFAULT false,
    responsable_id            UUID,
    responsable_nombre        VARCHAR(200),
    responsable_email         VARCHAR(200),
    estado                    risk.estado_riesgo NOT NULL DEFAULT 'pendiente',
    fecha_evaluacion          DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_reevaluacion        DATE,
    creado_por_email          VARCHAR(200),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

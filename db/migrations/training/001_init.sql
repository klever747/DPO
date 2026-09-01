-- Esquema training: formación en protección de datos
SET search_path TO training;

CREATE TYPE training.tipo_formacion AS ENUM ('presencial', 'online', 'elearning');
CREATE TYPE training.estado_participante AS ENUM ('inscrito', 'completado', 'no_completado');

CREATE TABLE IF NOT EXISTS formaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL,
    titulo          VARCHAR(250) NOT NULL,
    descripcion     TEXT,
    tipo            training.tipo_formacion NOT NULL DEFAULT 'elearning',
    fecha_inicio    DATE,
    fecha_fin       DATE,
    duracion_horas  NUMERIC(5,1),
    obligatoria     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS formacion_participantes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formacion_id        UUID NOT NULL REFERENCES formaciones(id) ON DELETE CASCADE,
    nombre              VARCHAR(200) NOT NULL,
    email               VARCHAR(200),
    estado              training.estado_participante NOT NULL DEFAULT 'inscrito',
    fecha_completado    TIMESTAMPTZ,
    calificacion        NUMERIC(4,1),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_empresa ON formaciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_training_participantes_formacion ON formacion_participantes(formacion_id);

-- Esquema maturity: evaluaciones de madurez en protección de datos
SET search_path TO maturity;

CREATE TABLE IF NOT EXISTS evaluaciones_madurez (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL,
    fecha_evaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    modelo          VARCHAR(150) NOT NULL DEFAULT 'DPO-5-Niveles',
    evaluador       VARCHAR(200),
    nivel_global    NUMERIC(3,1),
    observaciones   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS madurez_dominios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id   UUID NOT NULL REFERENCES evaluaciones_madurez(id) ON DELETE CASCADE,
    dominio         VARCHAR(150) NOT NULL, -- gobernanza, tecnico, organizativo, formacion, terceros...
    nivel           SMALLINT NOT NULL CHECK (nivel BETWEEN 1 AND 5),
    observaciones   TEXT
);

CREATE INDEX IF NOT EXISTS idx_maturity_empresa ON evaluaciones_madurez(empresa_id);
CREATE INDEX IF NOT EXISTS idx_maturity_dominios_eval ON madurez_dominios(evaluacion_id);

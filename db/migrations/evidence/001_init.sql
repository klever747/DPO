-- Esquema evidence: evidencias documentales transversales a todos los módulos
SET search_path TO evidence;

CREATE TYPE evidence.tipo_evidencia AS ENUM ('documento', 'captura', 'registro', 'firma', 'otro');

CREATE TABLE IF NOT EXISTS evidencias (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL,
    modulo_origen   VARCHAR(50) NOT NULL, -- consent, rat, arco, breach, retention, ethics, maturity, training, contracts, audit
    referencia_id   UUID NOT NULL,        -- id del registro relacionado en el módulo de origen
    tipo_evidencia  evidence.tipo_evidencia NOT NULL DEFAULT 'documento',
    nombre_archivo  VARCHAR(300) NOT NULL,
    url_almacenamiento VARCHAR(500) NOT NULL,
    hash_integridad VARCHAR(128),
    subido_por      VARCHAR(200),
    fecha_subida    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_empresa ON evidencias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_evidence_modulo_ref ON evidencias(modulo_origen, referencia_id);

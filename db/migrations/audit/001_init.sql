-- Esquema audit: auditorías y hallazgos
SET search_path TO audit;

CREATE TYPE audit.tipo_auditoria AS ENUM ('interna', 'externa', 'seguimiento');
CREATE TYPE audit.estado_auditoria AS ENUM ('planificada', 'en_curso', 'finalizada');
CREATE TYPE audit.severidad_hallazgo AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE audit.estado_hallazgo AS ENUM ('abierto', 'en_remediacion', 'cerrado');

CREATE TABLE IF NOT EXISTS auditorias (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL,
    tipo                audit.tipo_auditoria NOT NULL DEFAULT 'interna',
    alcance             TEXT,
    auditor             VARCHAR(200),
    fecha_inicio        DATE,
    fecha_fin           DATE,
    estado              audit.estado_auditoria NOT NULL DEFAULT 'planificada',
    resultado_general   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hallazgos_auditoria (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auditoria_id                UUID NOT NULL REFERENCES auditorias(id) ON DELETE CASCADE,
    descripcion                 TEXT NOT NULL,
    severidad                   audit.severidad_hallazgo NOT NULL DEFAULT 'media',
    recomendacion               TEXT,
    responsable                 VARCHAR(200),
    estado                      audit.estado_hallazgo NOT NULL DEFAULT 'abierto',
    fecha_limite_remediacion    DATE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_empresa ON auditorias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_hallazgos_auditoria ON hallazgos_auditoria(auditoria_id);

-- Esquema consent: titulares de datos y consentimientos
SET search_path TO consent;

CREATE TABLE IF NOT EXISTS titulares (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL, -- referencia lógica a auth.empresas
    nombre              VARCHAR(200) NOT NULL,
    email               VARCHAR(200),
    documento_identidad VARCHAR(50),
    telefono            VARCHAR(50),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE consent.canal_consentimiento AS ENUM ('web', 'app', 'papel', 'telefono', 'email', 'presencial');
CREATE TYPE consent.estado_consentimiento AS ENUM ('otorgado', 'revocado', 'expirado');

CREATE TABLE IF NOT EXISTS consentimientos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL,
    titular_id          UUID NOT NULL REFERENCES titulares(id) ON DELETE CASCADE,
    finalidad           TEXT NOT NULL,
    base_legal          VARCHAR(200),
    canal               consent.canal_consentimiento NOT NULL DEFAULT 'web',
    version_texto_legal VARCHAR(50),
    estado              consent.estado_consentimiento NOT NULL DEFAULT 'otorgado',
    fecha_otorgamiento  TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_revocacion    TIMESTAMPTZ,
    ip_origen           VARCHAR(64),
    evidencia_url       VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consentimientos_titular ON consentimientos(titular_id);
CREATE INDEX IF NOT EXISTS idx_consentimientos_empresa ON consentimientos(empresa_id);

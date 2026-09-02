-- Agrega el estado de firma del documento (firmado / en proceso / no autorizado)
-- y sustituye el "canal" por un "tipo de archivo" (físico / digital / escaneado / otro).
SET search_path TO consent;

CREATE TYPE consent.estado_documento AS ENUM ('firmado', 'en_proceso', 'no_autorizado');
ALTER TABLE consentimientos ADD COLUMN IF NOT EXISTS estado_documento consent.estado_documento NOT NULL DEFAULT 'en_proceso';

CREATE TYPE consent.tipo_archivo AS ENUM ('fisico', 'digital', 'escaneado', 'otro');
ALTER TABLE consentimientos ADD COLUMN IF NOT EXISTS tipo_archivo consent.tipo_archivo NOT NULL DEFAULT 'digital';

-- Estima el tipo de archivo a partir del canal existente (que se conserva, pero deja de usarse en el frontend).
UPDATE consentimientos SET tipo_archivo = 'fisico' WHERE canal IN ('papel', 'presencial');
UPDATE consentimientos SET tipo_archivo = 'digital' WHERE canal IN ('web', 'app', 'telefono', 'email');

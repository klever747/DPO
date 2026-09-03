-- Historial de accesos (login) a la plataforma, para el panel de auditoría.
SET search_path TO auth;

CREATE TABLE IF NOT EXISTS registro_accesos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID,
    email       VARCHAR(200) NOT NULL,
    exitoso     BOOLEAN NOT NULL,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registro_accesos_usuario ON registro_accesos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registro_accesos_creado ON registro_accesos(creado_en DESC);

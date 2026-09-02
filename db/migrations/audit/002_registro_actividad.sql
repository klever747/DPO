-- Registro de actividad de la plataforma (qué acción hizo cada usuario, en qué
-- microservicio), alimentado por el gateway en cada petición de escritura.
SET search_path TO audit;

CREATE TABLE IF NOT EXISTS registro_actividad (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID NOT NULL,
    usuario_email   VARCHAR(200) NOT NULL,
    rol             VARCHAR(50) NOT NULL,
    empresa_ids     TEXT[] NOT NULL DEFAULT '{}',
    metodo          VARCHAR(10) NOT NULL,
    ruta            VARCHAR(300) NOT NULL,
    servicio        VARCHAR(100) NOT NULL,
    exitoso         BOOLEAN NOT NULL DEFAULT true,
    status_code     INTEGER,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registro_actividad_usuario ON registro_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registro_actividad_creado ON registro_actividad(creado_en DESC);

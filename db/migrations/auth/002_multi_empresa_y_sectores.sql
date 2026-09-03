-- Añade soporte multi-empresa por usuario, permisos por módulo y un
-- catálogo administrable de sectores.
SET search_path TO auth;

-- Relación muchos-a-muchos usuario <-> empresa (antes era 1 empresa por usuario)
CREATE TABLE IF NOT EXISTS usuario_empresas (
    usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, empresa_id)
);

-- Migra la asignación única existente (usuarios.empresa_id) a la nueva tabla puente.
-- La columna usuarios.empresa_id se conserva (no se borra) por compatibilidad,
-- pero deja de usarse: la fuente de verdad pasa a ser usuario_empresas.
INSERT INTO usuario_empresas (usuario_id, empresa_id)
SELECT id, empresa_id FROM usuarios WHERE empresa_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Claves de módulo (ver @dpo/common MODULE_CATALOG) que el usuario puede ver/usar.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS modulos_permitidos TEXT[] NOT NULL DEFAULT '{}';

-- Catálogo administrable de sectores (para el <select> de Empresas).
CREATE TABLE IF NOT EXISTS sectores (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      VARCHAR(150) NOT NULL UNIQUE,
    activo      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sectores (nombre) VALUES
    ('Tecnología'), ('Salud'), ('Educación'), ('Finanzas'), ('Retail'),
    ('Inmobiliario'), ('Manufactura'), ('Servicios profesionales'),
    ('Gobierno'), ('Otro')
ON CONFLICT (nombre) DO NOTHING;

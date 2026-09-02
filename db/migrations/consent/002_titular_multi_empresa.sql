-- Un titular puede pertenecer a varias empresas (antes era 1 empresa por titular).
SET search_path TO consent;

CREATE TABLE IF NOT EXISTS titular_empresas (
    titular_id  UUID NOT NULL REFERENCES titulares(id) ON DELETE CASCADE,
    empresa_id  UUID NOT NULL, -- referencia lógica a auth.empresas
    PRIMARY KEY (titular_id, empresa_id)
);

-- Migra la asignación única existente (titulares.empresa_id) a la tabla puente.
-- La columna titulares.empresa_id se conserva (no se borra) por compatibilidad,
-- pero deja de usarse: la fuente de verdad pasa a ser titular_empresas.
INSERT INTO titular_empresas (titular_id, empresa_id)
SELECT id, empresa_id FROM titulares WHERE empresa_id IS NOT NULL
ON CONFLICT DO NOTHING;

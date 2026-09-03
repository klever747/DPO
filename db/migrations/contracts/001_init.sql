-- Esquema contracts: plantillas de contratos y contratos asignados a terceros
SET search_path TO contracts;

CREATE TYPE contracts.tipo_plantilla AS ENUM ('encargado_tratamiento', 'confidencialidad', 'transferencia_internacional', 'clausulas_arco', 'otro');
CREATE TYPE contracts.estado_contrato AS ENUM ('vigente', 'vencido', 'rescindido');

CREATE TABLE IF NOT EXISTS plantillas_contrato (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL,
    nombre          VARCHAR(250) NOT NULL,
    tipo            contracts.tipo_plantilla NOT NULL,
    version         VARCHAR(50) NOT NULL DEFAULT '1.0',
    idioma          VARCHAR(10) NOT NULL DEFAULT 'es',
    contenido_url   VARCHAR(500),
    vigente         BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contratos_asignados (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plantilla_id        UUID NOT NULL REFERENCES plantillas_contrato(id) ON DELETE RESTRICT,
    tercero_nombre      VARCHAR(250) NOT NULL,
    tercero_nif         VARCHAR(50),
    fecha_firma         DATE,
    fecha_vencimiento   DATE,
    estado              contracts.estado_contrato NOT NULL DEFAULT 'vigente',
    archivo_url         VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_empresa ON plantillas_contrato(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contratos_asignados_plantilla ON contratos_asignados(plantilla_id);

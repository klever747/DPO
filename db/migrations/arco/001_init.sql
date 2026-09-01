-- Esquema arco: solicitudes de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) + Portabilidad/Limitación
SET search_path TO arco;

CREATE TYPE arco.tipo_derecho AS ENUM ('acceso', 'rectificacion', 'cancelacion', 'oposicion', 'portabilidad', 'limitacion');
CREATE TYPE arco.estado_solicitud AS ENUM ('recibida', 'en_proceso', 'resuelta', 'rechazada');

CREATE TABLE IF NOT EXISTS solicitudes_arco (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL,
    titular_nombre      VARCHAR(200) NOT NULL,
    titular_email       VARCHAR(200),
    titular_documento   VARCHAR(50),
    tipo_derecho        arco.tipo_derecho NOT NULL,
    descripcion         TEXT,
    estado              arco.estado_solicitud NOT NULL DEFAULT 'recibida',
    canal_recepcion     VARCHAR(100),
    fecha_solicitud     TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_limite        TIMESTAMPTZ,
    fecha_resolucion    TIMESTAMPTZ,
    respuesta           TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_arco_empresa ON solicitudes_arco(empresa_id);

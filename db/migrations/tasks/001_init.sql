-- Esquema tasks: tareas de cumplimiento asignadas a jefes de departamento,
-- con evidencia de cumplimiento, revisión del DPO y notificaciones.
CREATE SCHEMA IF NOT EXISTS tasks;
SET search_path TO tasks;

CREATE TYPE tasks.estado_tarea AS ENUM ('pendiente', 'en_revision', 'completada', 'rechazada');

CREATE TABLE IF NOT EXISTS tareas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL,
    departamento_id     UUID,
    departamento_nombre VARCHAR(150),
    asignado_a_id       UUID NOT NULL,
    asignado_a_nombre   VARCHAR(200) NOT NULL,
    asignado_a_email    VARCHAR(200),
    titulo              VARCHAR(250) NOT NULL,
    descripcion         TEXT,
    base_legal          VARCHAR(300),
    fecha_limite        DATE NOT NULL,
    estado              tasks.estado_tarea NOT NULL DEFAULT 'pendiente',
    evidencia_url       VARCHAR(500),
    fecha_completada    TIMESTAMPTZ,
    revisado_por_email  VARCHAR(200),
    comentario_revision TEXT,
    fecha_revision      TIMESTAMPTZ,
    creado_por_email    VARCHAR(200),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id    UUID NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    usuario_id  UUID NOT NULL,
    mensaje     TEXT NOT NULL,
    leida       BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tareas_empresa ON tareas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tareas_asignado ON tareas(asignado_a_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

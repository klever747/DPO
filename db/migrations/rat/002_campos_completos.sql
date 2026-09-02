-- Amplía el RAT con los campos de una plantilla completa de Registro de
-- Actividades de Tratamiento (rol de la organización, responsables,
-- origen de los datos, volumen, ámbito geográfico, cesiones, etc.)
SET search_path TO rat;

CREATE TYPE rat.rol_organizacion AS ENUM ('responsable', 'encargado', 'corresponsable');
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS rol_organizacion rat.rol_organizacion NOT NULL DEFAULT 'responsable';

CREATE TYPE rat.volumen_tratamiento AS ENUM ('bajo', 'medio', 'alto');
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS volumen_tratamientos rat.volumen_tratamiento NOT NULL DEFAULT 'bajo';

ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS persona_responsable VARCHAR(200);
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS departamento_propietario VARCHAR(200);
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS origen_datos VARCHAR(300);
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS tratamiento_ocasional BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS ambito_geografico VARCHAR(150);
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS ejercicio_derechos TEXT;
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS finalidad_cesion VARCHAR(300);
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS sistema_informacion VARCHAR(200);
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS conservacion_papel BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE actividades_tratamiento ADD COLUMN IF NOT EXISTS almacenamiento_local BOOLEAN NOT NULL DEFAULT false;

-- Se separa el RUC (identificador tributario, 13 dígitos en Ecuador) del
-- campo "nif", que en la práctica se venía usando como código interno de la
-- empresa (ej. "REITZ-03"). Se agrega una columna nueva para el RUC real.
SET search_path TO auth;

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS ruc VARCHAR(13);
CREATE UNIQUE INDEX IF NOT EXISTS empresas_ruc_key ON empresas (ruc) WHERE ruc IS NOT NULL;

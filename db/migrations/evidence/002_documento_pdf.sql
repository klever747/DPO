-- Permite registrar evidencias sin ligarlas obligatoriamente a un registro
-- puntual de otro módulo (para escaneos/documentos generales de evidencia).
SET search_path TO evidence;

ALTER TABLE evidencias ALTER COLUMN referencia_id DROP NOT NULL;

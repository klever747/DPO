-- Permite adjuntar el formulario de solicitud (PDF/DOCX/imagen escaneada) a cada solicitud ARCO.
SET search_path TO arco;

ALTER TABLE solicitudes_arco ADD COLUMN IF NOT EXISTS documento_url VARCHAR(500);

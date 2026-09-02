import { mkdirSync } from 'fs';
import { join } from 'path';

export const SOLICITUD_UPLOAD_DIR = process.env.SOLICITUD_UPLOAD_DIR || join(process.cwd(), 'uploads', 'solicitudes-arco');

mkdirSync(SOLICITUD_UPLOAD_DIR, { recursive: true });

import { mkdirSync } from 'fs';
import { join } from 'path';

export const EVIDENCIA_UPLOAD_DIR = process.env.EVIDENCIA_UPLOAD_DIR || join(process.cwd(), 'uploads', 'evidencias');

mkdirSync(EVIDENCIA_UPLOAD_DIR, { recursive: true });

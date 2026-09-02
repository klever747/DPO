import { mkdirSync } from 'fs';
import { join } from 'path';

export const PLANTILLA_UPLOAD_DIR = process.env.PLANTILLA_UPLOAD_DIR || join(process.cwd(), 'uploads', 'plantillas');

mkdirSync(PLANTILLA_UPLOAD_DIR, { recursive: true });

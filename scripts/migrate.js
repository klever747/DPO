#!/usr/bin/env node
/**
 * Ejecuta todas las migraciones SQL de db/init y db/migrations/<schema>/*.sql
 * en orden alfabético, dentro de una transacción por archivo.
 *
 * Uso:
 *   node scripts/migrate.js
 *
 * Requiere variables de entorno (ver .env.example): DATABASE_URL o
 * POSTGRES_HOST/PORT/DB/USER/PASSWORD/SSL.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT = path.resolve(__dirname, '..');
const INIT_DIR = path.join(ROOT, 'db', 'init');
const MIGRATIONS_DIR = path.join(ROOT, 'db', 'migrations');

function buildConnectionConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'dpo_platform',
    user: process.env.POSTGRES_USER || 'dpo_admin',
    password: process.env.POSTGRES_PASSWORD || '',
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

function listSqlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => path.join(dir, f));
}

async function runFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  process.stdout.write(`-> Aplicando ${path.relative(ROOT, filePath)} ... `);
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('OK');
  } catch (err) {
    await client.query('ROLLBACK');
    console.log('ERROR');
    throw err;
  }
}

async function main() {
  const client = new Client(buildConnectionConfig());
  await client.connect();

  try {
    const files = [
      ...listSqlFiles(INIT_DIR),
      ...fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((d) => fs.statSync(path.join(MIGRATIONS_DIR, d)).isDirectory())
        .sort()
        .flatMap((schema) => listSqlFiles(path.join(MIGRATIONS_DIR, schema))),
    ];

    if (files.length === 0) {
      console.log('No se encontraron archivos .sql en db/init o db/migrations/*');
      return;
    }

    for (const file of files) {
      await runFile(client, file);
    }

    console.log(`\nMigraciones completadas: ${files.length} archivo(s) aplicados.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\nFalló la migración:', err.message);
  process.exit(1);
});

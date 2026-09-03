import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Construye la configuración de conexión TypeORM para un microservicio,
 * apuntando siempre al esquema PostgreSQL propio de ese dominio dentro de
 * la misma base de datos física (patrón schema-per-service, adecuado para
 * despliegues en hosting administrado como Hostinger, donde el número de
 * bases de datos físicas suele estar limitado).
 *
 * El esquema de las tablas se gestiona con SQL versionado en db/migrations
 * (ver scripts/migrate.js) — por eso `synchronize` siempre es `false`.
 */
export function buildTypeOrmOptions(
  schema: string,
  entities: Function[],
): TypeOrmModuleOptions {
  const useSsl = process.env.POSTGRES_SSL === 'true';
  const base: TypeOrmModuleOptions = {
    type: 'postgres',
    schema,
    entities,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  };

  if (process.env.DATABASE_URL) {
    return { ...base, url: process.env.DATABASE_URL };
  }

  return {
    ...base,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'dpo_platform',
    username: process.env.POSTGRES_USER || 'dpo_admin',
    password: process.env.POSTGRES_PASSWORD || '',
  };
}

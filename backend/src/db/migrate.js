/**
 * Lightweight, dependency-free SQL migration runner.
 * Applies every .sql file in /migrations, in filename order, exactly once,
 * tracking progress in a schema_migrations table.
 *
 * Usage: node src/db/migrate.js up
 *        node src/db/migrate.js down   (drops schema_migrations tracking only — irreversible
 *                                        DDL rollbacks are intentionally NOT auto-generated)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool } from '../config/database.js';
import logger from '../config/logger.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations() {
  const { rows } = await pool.query('SELECT name FROM schema_migrations ORDER BY id');
  return new Set(rows.map((r) => r.name));
}

async function up() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();

  let ranCount = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    logger.info(`Applying migration: ${file}`);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      ranCount += 1;
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`Migration failed: ${file} — ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  logger.info(ranCount ? `Applied ${ranCount} migration(s).` : 'Database already up to date.');
}

async function down() {
  await ensureMigrationsTable();
  const { rows } = await pool.query('SELECT name FROM schema_migrations ORDER BY id DESC LIMIT 1');
  if (!rows.length) {
    logger.info('No migrations to unmark.');
    return;
  }
  await pool.query('DELETE FROM schema_migrations WHERE name = $1', [rows[0].name]);
  logger.warn(`Unmarked ${rows[0].name}. Note: DDL changes were NOT reverted automatically — write a compensating migration.`);
}

const command = process.argv[2];

(async () => {
  try {
    if (command === 'down') await down();
    else await up();
  } catch (err) {
    logger.error(err.stack || err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

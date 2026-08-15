import pg from 'pg';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  // Serverless Postgres (Neon) suspends an idle compute and takes several seconds to
  // wake. 5s wasn't enough headroom for that cold start, which surfaced as repeated
  // "Connection terminated due to connection timeout" boots.
  connectionTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  logger.error(`Unexpected PostgreSQL pool error: ${err.message}`);
});

/**
 * Run a single query against the pool.
 * @param {string} text
 * @param {Array<any>} params
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Run a callback inside a transaction, committing on success and
 * rolling back automatically if the callback throws.
 * @param {(client: pg.PoolClient) => Promise<any>} callback
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default pool;

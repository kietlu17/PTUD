const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'qlth',
  password: process.env.POSTGRES_PASSWORD || '404',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

async function init() {
  // ensure tables exist
  await pool.query(
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT,
      created_at TIMESTAMP DEFAULT now()
    )`
  );
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  init,
};

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'qlth',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || '404',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    dialect: 'postgres',
    logging: false,
  } 
);

async function init() {
  try {
    await sequelize.authenticate();
    // models should be imported before sync (they register themselves on sequelize)
    await sequelize.sync({ alter: true });
    // Ensure primary key sequences exist and are correctly set for Postgres tables
    // (some existing databases may have integer PKs without DEFAULT nextval)
    try {
      // Create sequence for MonHoc.id if not exists and set default
      await sequelize.query(`CREATE SEQUENCE IF NOT EXISTS "MonHoc_id_seq"`);
      await sequelize.query(`SELECT setval('"MonHoc_id_seq"', COALESCE((SELECT MAX(id) FROM "MonHoc"), 0) + 1, false)`);
      await sequelize.query(`ALTER TABLE "MonHoc" ALTER COLUMN id SET DEFAULT nextval('"MonHoc_id_seq"')`);
    } catch (e) {
      // don't crash startup for other DBs — log and continue
      console.warn('Warning while ensuring MonHoc id sequence:', e.message || e);
    }
    console.log('Sequelize connected and synced');
  } catch (err) {
    console.error('Unable to connect to the database with Sequelize:', err);
    throw err;
  }
}

module.exports = { sequelize, init };

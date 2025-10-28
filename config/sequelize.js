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
    await sequelize.sync();
    console.log('Sequelize connected and synced');
  } catch (err) {
    console.error('Unable to connect to the database with Sequelize:', err);
    throw err;
  }
}

module.exports = { sequelize, init };

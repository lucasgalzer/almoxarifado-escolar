require('dotenv').config()

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'almoxarifado_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  }
}
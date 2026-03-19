const { Pool } = require('pg')
require('dotenv').config()

const isLocal = process.env.DB_HOST === 'localhost' || !process.env.DB_HOST

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'halleyx_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: isLocal ? false : { rejectUnauthorized: false }
})

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err)
  } else {
    console.log('Database connected successfully!')
  }
})
module.exports = pool
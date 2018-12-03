'use strict'

require('dotenv').config()

const dbDetails = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql'
}

module.exports = {
  development: dbDetails,
  production: dbDetails
}

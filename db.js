const { Pool } = require('pg')
require("dotenv").config()

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "password",
  database: "orsomworld",
  port: "5433",
})

export const query = (text, params) => pool.query(text, params)

// module.exports = {
//   query: (text, params) => pool.query(text, params),
// }


import mysql from "mysql2/promise";
import { logger } from "./logger";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function initMySQL() {
  await pool.execute("SELECT 1");
  logger.info("MySQL connected");
}

export default pool;

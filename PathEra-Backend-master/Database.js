import { Sequelize } from "sequelize";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Postgres returns BIGINT (jobs.id) as a string by default; job IDs fit in a JS number
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => parseInt(value, 10));

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy your Supabase connection string into .env"
  );
}

// Supabase requires SSL; set DATABASE_SSL=false for a local Postgres
const useSsl = process.env.DATABASE_SSL !== "false";

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  pool: {
    max: 10,
    idle: 10000,
  },
});

db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

export default db;

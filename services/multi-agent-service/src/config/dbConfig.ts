import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connectPostgres = async () => {
  await pool.connect();
  console.log("DB connected");
};

export default connectPostgres;
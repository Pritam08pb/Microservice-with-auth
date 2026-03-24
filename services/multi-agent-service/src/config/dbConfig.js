"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const connectPostgres = async () => {
    await pool.connect();
    console.log("DB connected");
};
exports.default = connectPostgres;
//# sourceMappingURL=dbConfig.js.map
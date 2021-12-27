import {Pool} from 'pg';

const DB_URL = process.env.DATABASE_URL;

export const RAW_NAME = (id: string) => `raw_${id}`;

export const CREDENTIAL = process.env.CREDENTIAL;

export const INIT_FILE = JSON.stringify(new Array(24).fill(null));

export const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});
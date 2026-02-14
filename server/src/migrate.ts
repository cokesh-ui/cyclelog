import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/001_initial.sql'), 'utf-8');
  try {
    await pool.query(sql);
    console.log('Migration completed successfully');
  } catch (err: any) {
    if (err.code === '42P07') {
      console.log('Tables already exist, skipping migration');
    } else {
      console.error('Migration failed:', err.message);
      process.exit(1);
    }
  }
  await pool.end();
}

migrate();

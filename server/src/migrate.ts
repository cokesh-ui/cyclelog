import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    try {
      await pool.query(sql);
      console.log(`Migration ${file} completed`);
    } catch (err: any) {
      if (err.code === '42P07' || err.code === '42701') {
        console.log(`Migration ${file} skipped (already applied)`);
      } else {
        console.error(`Migration ${file} failed:`, err.message);
        process.exit(1);
      }
    }
  }

  console.log('All migrations done');
  await pool.end();
}

migrate();

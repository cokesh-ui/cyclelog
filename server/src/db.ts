import pg from 'pg';
import { config } from './config.js';

// DATE 타입을 문자열 그대로 반환 (timezone 변환 방지)
pg.types.setTypeParser(1082, (val: string) => val);

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
});

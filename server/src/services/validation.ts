import { pool } from '../db.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export async function validateFertilization(cycleId: string, totalFertilized: number): Promise<ValidationResult> {
  const ret = await pool.query('SELECT total_eggs FROM retrievals WHERE cycle_id = $1', [cycleId]);
  if (ret.rows.length === 0) {
    return { valid: false, error: '채취 기록이 없습니다. 먼저 채취를 입력해주세요.' };
  }
  if (totalFertilized > ret.rows[0].total_eggs) {
    return { valid: true, warning: `수정란 수(${totalFertilized})가 채취 수(${ret.rows[0].total_eggs})보다 많습니다` };
  }
  return { valid: true };
}

export async function validateTransfer(transferCount: number): Promise<ValidationResult> {
  if (transferCount > 3) {
    return { valid: true, warning: '이식 개수는 최대 3개까지 권장됩니다' };
  }
  return { valid: true };
}

export async function validatePGT(cycleId: string): Promise<ValidationResult> {
  const cult = await pool.query('SELECT day FROM cultures WHERE cycle_id = $1', [cycleId]);
  if (cult.rows.length === 0) {
    return { valid: false, error: '배양 기록이 없습니다' };
  }
  if (cult.rows[0].day < 5) {
    return { valid: false, error: 'PGT는 배양 5일 이상부터 가능합니다' };
  }
  return { valid: true };
}

export async function cascadeCulturePlans(cycleId: string, newPlans: string[]): Promise<void> {
  const existing = await pool.query('SELECT next_plans FROM cultures WHERE cycle_id = $1', [cycleId]);
  if (existing.rows.length === 0) return;

  const oldPlans: string[] = existing.rows[0].next_plans || [];
  const removed = oldPlans.filter(p => !newPlans.includes(p));

  for (const plan of removed) {
    switch (plan) {
      case 'transfer':
        await pool.query('DELETE FROM transfers WHERE cycle_id = $1', [cycleId]);
        break;
      case 'freeze':
        await pool.query('DELETE FROM freezes WHERE cycle_id = $1', [cycleId]);
        break;
      case 'pgt':
        await pool.query('DELETE FROM pgts WHERE cycle_id = $1', [cycleId]);
        break;
    }
  }
}

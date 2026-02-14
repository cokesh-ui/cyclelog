import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

export const injectionsRouter = Router();
injectionsRouter.use(authMiddleware);

// 사이클 소유권 확인 헬퍼
async function verifyCycleOwner(cycleId: string, userId: string): Promise<boolean> {
  const res = await pool.query('SELECT id FROM cycles WHERE id = $1 AND user_id = $2', [cycleId, userId]);
  return res.rows.length > 0;
}

// POST /api/cycles/:cycleId/injections
injectionsRouter.post('/:cycleId/injections', async (req: AuthRequest, res) => {
  try {
    const { cycleId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const { medicationName, dosage, date, time, memo } = req.body;
    if (!medicationName || !dosage || !date) {
      res.status(400).json({ error: '약물명, 용량, 날짜를 입력해주세요' });
      return;
    }

    const result = await pool.query(
      'INSERT INTO injections (cycle_id, medication_name, dosage, date, time, memo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [cycleId, medicationName, dosage, date, time || null, memo || null]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      medicationName: row.medication_name,
      dosage: row.dosage,
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
      time: row.time || undefined,
      memo: row.memo || undefined,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/cycles/:cycleId/injections/:injId
injectionsRouter.patch('/:cycleId/injections/:injId', async (req: AuthRequest, res) => {
  try {
    const { cycleId, injId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const { medicationName, dosage, date, time, memo } = req.body;
    const result = await pool.query(
      `UPDATE injections SET
        medication_name = COALESCE($1, medication_name),
        dosage = COALESCE($2, dosage),
        date = COALESCE($3, date),
        time = $4,
        memo = $5
      WHERE id = $6 AND cycle_id = $7 RETURNING *`,
      [medicationName, dosage, date, time ?? null, memo ?? null, injId, cycleId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: '주사 기록을 찾을 수 없습니다' });
      return;
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      medicationName: row.medication_name,
      dosage: row.dosage,
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
      time: row.time || undefined,
      memo: row.memo || undefined,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cycles/:cycleId/injections/:injId
injectionsRouter.delete('/:cycleId/injections/:injId', async (req: AuthRequest, res) => {
  try {
    const { cycleId, injId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const result = await pool.query(
      'DELETE FROM injections WHERE id = $1 AND cycle_id = $2 RETURNING id',
      [injId, cycleId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: '주사 기록을 찾을 수 없습니다' });
      return;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

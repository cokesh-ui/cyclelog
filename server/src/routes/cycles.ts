import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getAllCycles, getCycleById } from '../services/cycle.service.js';

export const cyclesRouter = Router();
cyclesRouter.use(authMiddleware);

// GET /api/cycles — 전체 사이클 목록
cyclesRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const cycles = await getAllCycles(req.userId!);
    res.json(cycles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cycles — 새 사이클 생성
cyclesRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const { cycleNumber, subtitle, startDate, cycleType } = req.body;
    if (!cycleNumber || !startDate) {
      res.status(400).json({ error: '회차와 시작일을 입력해주세요' });
      return;
    }

    const result = await pool.query(
      'INSERT INTO cycles (user_id, cycle_number, subtitle, start_date, title, cycle_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.userId, cycleNumber, subtitle || null, startDate, `${cycleNumber}차`, cycleType || 'standard']
    );

    const cycle = await getCycleById(result.rows[0].id, req.userId!);
    res.status(201).json(cycle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cycles/:cycleId — 사이클 상세
cyclesRouter.get('/:cycleId', async (req: AuthRequest, res) => {
  try {
    const cycle = await getCycleById(req.params.cycleId, req.userId!);
    if (!cycle) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }
    res.json(cycle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/cycles/:cycleId — 사이클 메타 수정
cyclesRouter.patch('/:cycleId', async (req: AuthRequest, res) => {
  try {
    const { cycleNumber, subtitle, title, cycleType, injectionSkipped } = req.body;
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (cycleNumber !== undefined) { fields.push(`cycle_number = $${idx++}`); values.push(cycleNumber); }
    if (subtitle !== undefined) { fields.push(`subtitle = $${idx++}`); values.push(subtitle || null); }
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title || null); }
    if (cycleType !== undefined) { fields.push(`cycle_type = $${idx++}`); values.push(cycleType); }
    if (injectionSkipped !== undefined) { fields.push(`injection_skipped = $${idx++}`); values.push(injectionSkipped); }

    if (fields.length === 0) {
      res.status(400).json({ error: '수정할 항목이 없습니다' });
      return;
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.params.cycleId, req.userId);

    const result = await pool.query(
      `UPDATE cycles SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const cycle = await getCycleById(req.params.cycleId, req.userId!);
    res.json(cycle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cycles/:cycleId — 사이클 삭제
cyclesRouter.delete('/:cycleId', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cycles WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.cycleId, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

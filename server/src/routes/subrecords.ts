import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getCycleById } from '../services/cycle.service.js';
import { validateFertilization, validateTransfer, validatePGT, cascadeCulturePlans } from '../services/validation.js';

export const subrecordsRouter = Router();
subrecordsRouter.use(authMiddleware);

async function verifyCycleOwner(cycleId: string, userId: string): Promise<boolean> {
  const res = await pool.query('SELECT id FROM cycles WHERE id = $1 AND user_id = $2', [cycleId, userId]);
  return res.rows.length > 0;
}

// PUT /api/cycles/:cycleId/retrieval
subrecordsRouter.put('/:cycleId/retrieval', async (req: AuthRequest, res) => {
  try {
    const { cycleId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const { retrievalDate, totalEggs, memo } = req.body;
    if (!retrievalDate || totalEggs === undefined) {
      res.status(400).json({ error: '채취일과 채취 수를 입력해주세요' });
      return;
    }

    await pool.query(
      `INSERT INTO retrievals (cycle_id, retrieval_date, total_eggs, memo) VALUES ($1, $2, $3, $4)
       ON CONFLICT (cycle_id) DO UPDATE SET retrieval_date = $2, total_eggs = $3, memo = $4`,
      [cycleId, retrievalDate, totalEggs, memo || null]
    );

    const cycle = await getCycleById(cycleId, req.userId!);
    res.json(cycle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cycles/:cycleId/fertilization
subrecordsRouter.put('/:cycleId/fertilization', async (req: AuthRequest, res) => {
  try {
    const { cycleId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const { fertilizationDate, totalFertilized, memo } = req.body;
    if (!fertilizationDate || totalFertilized === undefined) {
      res.status(400).json({ error: '수정일과 수정란 수를 입력해주세요' });
      return;
    }

    const validation = await validateFertilization(cycleId, totalFertilized);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    await pool.query(
      `INSERT INTO fertilizations (cycle_id, fertilization_date, total_fertilized, memo) VALUES ($1, $2, $3, $4)
       ON CONFLICT (cycle_id) DO UPDATE SET fertilization_date = $2, total_fertilized = $3, memo = $4`,
      [cycleId, fertilizationDate, totalFertilized, memo || null]
    );

    const cycle = await getCycleById(cycleId, req.userId!);
    res.json({ ...cycle, warning: validation.warning });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cycles/:cycleId/culture
subrecordsRouter.put('/:cycleId/culture', async (req: AuthRequest, res) => {
  try {
    const { cycleId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const { day, totalEmbryos, nextPlans, gradeA, gradeB, gradeC, memo } = req.body;
    if (day === undefined || totalEmbryos === undefined) {
      res.status(400).json({ error: '배양 일수와 배아 수를 입력해주세요' });
      return;
    }

    // Cascade: 제거된 plan의 데이터 삭제
    await cascadeCulturePlans(cycleId, nextPlans || []);

    await pool.query(
      `INSERT INTO cultures (cycle_id, day, total_embryos, next_plans, grade_a, grade_b, grade_c, memo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (cycle_id) DO UPDATE SET
         day = $2, total_embryos = $3, next_plans = $4, grade_a = $5, grade_b = $6, grade_c = $7, memo = $8`,
      [cycleId, day, totalEmbryos, nextPlans || [], gradeA ?? null, gradeB ?? null, gradeC ?? null, memo || null]
    );

    const cycle = await getCycleById(cycleId, req.userId!);
    res.json(cycle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cycles/:cycleId/transfer
subrecordsRouter.put('/:cycleId/transfer', async (req: AuthRequest, res) => {
  try {
    const { cycleId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const { transferDate, transferCount, memo } = req.body;
    if (!transferDate || transferCount === undefined) {
      res.status(400).json({ error: '이식일과 이식 수를 입력해주세요' });
      return;
    }

    const validation = await validateTransfer(transferCount);

    await pool.query(
      `INSERT INTO transfers (cycle_id, transfer_date, transfer_count, memo) VALUES ($1, $2, $3, $4)
       ON CONFLICT (cycle_id) DO UPDATE SET transfer_date = $2, transfer_count = $3, memo = $4`,
      [cycleId, transferDate, transferCount, memo || null]
    );

    const cycle = await getCycleById(cycleId, req.userId!);
    res.json({ ...cycle, warning: validation.warning });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cycles/:cycleId/freeze
subrecordsRouter.put('/:cycleId/freeze', async (req: AuthRequest, res) => {
  try {
    const { cycleId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const { freezeDate, frozenCount, memo } = req.body;
    if (!freezeDate || frozenCount === undefined) {
      res.status(400).json({ error: '동결일과 동결 수를 입력해주세요' });
      return;
    }

    await pool.query(
      `INSERT INTO freezes (cycle_id, freeze_date, frozen_count, memo) VALUES ($1, $2, $3, $4)
       ON CONFLICT (cycle_id) DO UPDATE SET freeze_date = $2, frozen_count = $3, memo = $4`,
      [cycleId, freezeDate, frozenCount, memo || null]
    );

    const cycle = await getCycleById(cycleId, req.userId!);
    res.json(cycle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cycles/:cycleId/pgt
subrecordsRouter.put('/:cycleId/pgt', async (req: AuthRequest, res) => {
  try {
    const { cycleId } = req.params;
    if (!(await verifyCycleOwner(cycleId, req.userId!))) {
      res.status(404).json({ error: '사이클을 찾을 수 없습니다' });
      return;
    }

    const validation = await validatePGT(cycleId);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const { tested, euploid, mosaic, abnormal, resultDate } = req.body;
    if (tested === undefined || euploid === undefined || abnormal === undefined || !resultDate) {
      res.status(400).json({ error: '필수 항목을 모두 입력해주세요' });
      return;
    }

    await pool.query(
      `INSERT INTO pgts (cycle_id, tested, euploid, mosaic, abnormal, result_date) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (cycle_id) DO UPDATE SET tested = $2, euploid = $3, mosaic = $4, abnormal = $5, result_date = $6`,
      [cycleId, tested, euploid, mosaic ?? null, abnormal, resultDate]
    );

    const cycle = await getCycleById(cycleId, req.userId!);
    res.json(cycle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

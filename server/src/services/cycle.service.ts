import { pool } from '../db.js';
import { Cycle, InjectionRecord, RetrievalRecord, FertilizationRecord, EmbryoCultureRecord, TransferRecord, FreezeRecord, PGTRecord } from '../types.js';

function mapInjection(row: any): InjectionRecord {
  return {
    id: row.id,
    medicationName: row.medication_name,
    dosage: row.dosage,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
    time: row.time || undefined,
    memo: row.memo || undefined,
  };
}

function mapRetrieval(row: any): RetrievalRecord {
  return {
    retrievalDate: row.retrieval_date instanceof Date ? row.retrieval_date.toISOString().split('T')[0] : row.retrieval_date,
    totalEggs: row.total_eggs,
    memo: row.memo || undefined,
  };
}

function mapFertilization(row: any): FertilizationRecord {
  return {
    fertilizationDate: row.fertilization_date instanceof Date ? row.fertilization_date.toISOString().split('T')[0] : row.fertilization_date,
    totalFertilized: row.total_fertilized,
    memo: row.memo || undefined,
  };
}

function mapCulture(row: any): EmbryoCultureRecord {
  return {
    day: row.day,
    totalEmbryos: row.total_embryos,
    nextPlans: row.next_plans?.length > 0 ? row.next_plans : undefined,
    gradeA: row.grade_a ?? undefined,
    gradeB: row.grade_b ?? undefined,
    gradeC: row.grade_c ?? undefined,
    memo: row.memo || undefined,
  };
}

function mapTransfer(row: any): TransferRecord {
  return {
    transferDate: row.transfer_date instanceof Date ? row.transfer_date.toISOString().split('T')[0] : row.transfer_date,
    transferCount: row.transfer_count,
    memo: row.memo || undefined,
  };
}

function mapFreeze(row: any): FreezeRecord {
  return {
    freezeDate: row.freeze_date instanceof Date ? row.freeze_date.toISOString().split('T')[0] : row.freeze_date,
    frozenCount: row.frozen_count,
    memo: row.memo || undefined,
  };
}

function mapPGT(row: any): PGTRecord {
  return {
    tested: row.tested,
    euploid: row.euploid,
    mosaic: row.mosaic ?? undefined,
    abnormal: row.abnormal,
    resultDate: row.result_date instanceof Date ? row.result_date.toISOString().split('T')[0] : row.result_date,
  };
}

export async function getCycleById(cycleId: string, userId: string): Promise<Cycle | null> {
  const [cycleRes, injRes, retRes, fertRes, cultRes, transRes, freezeRes, pgtRes] = await Promise.all([
    pool.query('SELECT * FROM cycles WHERE id = $1 AND user_id = $2', [cycleId, userId]),
    pool.query('SELECT * FROM injections WHERE cycle_id = $1 ORDER BY date, time', [cycleId]),
    pool.query('SELECT * FROM retrievals WHERE cycle_id = $1', [cycleId]),
    pool.query('SELECT * FROM fertilizations WHERE cycle_id = $1', [cycleId]),
    pool.query('SELECT * FROM cultures WHERE cycle_id = $1', [cycleId]),
    pool.query('SELECT * FROM transfers WHERE cycle_id = $1', [cycleId]),
    pool.query('SELECT * FROM freezes WHERE cycle_id = $1', [cycleId]),
    pool.query('SELECT * FROM pgts WHERE cycle_id = $1', [cycleId]),
  ]);

  if (cycleRes.rows.length === 0) return null;

  const c = cycleRes.rows[0];
  return {
    id: c.id,
    startDate: c.start_date instanceof Date ? c.start_date.toISOString().split('T')[0] : c.start_date,
    cycleNumber: c.cycle_number,
    subtitle: c.subtitle || undefined,
    title: c.title || undefined,
    injections: injRes.rows.map(mapInjection),
    retrieval: retRes.rows[0] ? mapRetrieval(retRes.rows[0]) : undefined,
    fertilization: fertRes.rows[0] ? mapFertilization(fertRes.rows[0]) : undefined,
    culture: cultRes.rows[0] ? mapCulture(cultRes.rows[0]) : undefined,
    transfer: transRes.rows[0] ? mapTransfer(transRes.rows[0]) : undefined,
    freeze: freezeRes.rows[0] ? mapFreeze(freezeRes.rows[0]) : undefined,
    pgt: pgtRes.rows[0] ? mapPGT(pgtRes.rows[0]) : undefined,
  };
}

export async function getAllCycles(userId: string): Promise<Cycle[]> {
  const cyclesRes = await pool.query(
    'SELECT * FROM cycles WHERE user_id = $1 ORDER BY cycle_number ASC',
    [userId]
  );

  if (cyclesRes.rows.length === 0) return [];

  const cycleIds = cyclesRes.rows.map(c => c.id);

  const [injRes, retRes, fertRes, cultRes, transRes, freezeRes, pgtRes] = await Promise.all([
    pool.query('SELECT * FROM injections WHERE cycle_id = ANY($1) ORDER BY date, time', [cycleIds]),
    pool.query('SELECT * FROM retrievals WHERE cycle_id = ANY($1)', [cycleIds]),
    pool.query('SELECT * FROM fertilizations WHERE cycle_id = ANY($1)', [cycleIds]),
    pool.query('SELECT * FROM cultures WHERE cycle_id = ANY($1)', [cycleIds]),
    pool.query('SELECT * FROM transfers WHERE cycle_id = ANY($1)', [cycleIds]),
    pool.query('SELECT * FROM freezes WHERE cycle_id = ANY($1)', [cycleIds]),
    pool.query('SELECT * FROM pgts WHERE cycle_id = ANY($1)', [cycleIds]),
  ]);

  // Group sub-records by cycle_id
  const group = <T>(rows: any[], mapper: (r: any) => T): Map<string, T[]> => {
    const map = new Map<string, T[]>();
    for (const row of rows) {
      const arr = map.get(row.cycle_id) || [];
      arr.push(mapper(row));
      map.set(row.cycle_id, arr);
    }
    return map;
  };

  const injMap = group(injRes.rows, mapInjection);
  const retMap = group(retRes.rows, mapRetrieval);
  const fertMap = group(fertRes.rows, mapFertilization);
  const cultMap = group(cultRes.rows, mapCulture);
  const transMap = group(transRes.rows, mapTransfer);
  const freezeMap = group(freezeRes.rows, mapFreeze);
  const pgtMap = group(pgtRes.rows, mapPGT);

  return cyclesRes.rows.map(c => ({
    id: c.id,
    startDate: c.start_date instanceof Date ? c.start_date.toISOString().split('T')[0] : c.start_date,
    cycleNumber: c.cycle_number,
    subtitle: c.subtitle || undefined,
    title: c.title || undefined,
    injections: injMap.get(c.id) || [],
    retrieval: retMap.get(c.id)?.[0],
    fertilization: fertMap.get(c.id)?.[0],
    culture: cultMap.get(c.id)?.[0],
    transfer: transMap.get(c.id)?.[0],
    freeze: freezeMap.get(c.id)?.[0],
    pgt: pgtMap.get(c.id)?.[0],
  }));
}

export interface InjectionRecord {
  id: string;
  medicationName: string;
  dosage: string;
  date: string;
  time?: string;
  memo?: string;
}

export interface RetrievalRecord {
  retrievalDate: string;
  totalEggs: number;
  memo?: string;
}

export interface FertilizationRecord {
  fertilizationDate: string;
  totalFertilized: number;
  memo?: string;
}

export interface EmbryoCultureRecord {
  day: number;
  totalEmbryos: number;
  nextPlans?: ('transfer' | 'freeze' | 'pgt')[];
  gradeA?: number;
  gradeB?: number;
  gradeC?: number;
  memo?: string;
}

export interface TransferRecord {
  transferDate: string;
  transferCount: number;
  memo?: string;
}

export interface FreezeRecord {
  freezeDate: string;
  frozenCount: number;
  memo?: string;
}

export interface PGTRecord {
  tested: number;
  euploid: number;
  mosaic?: number;
  abnormal: number;
  resultDate: string;
}

export interface Cycle {
  id: string;
  startDate: string;
  cycleNumber: number;
  cycleType: 'standard' | 'transfer_only';
  injectionSkipped: boolean;
  subtitle?: string;
  title?: string;
  injections: InjectionRecord[];
  retrieval?: RetrievalRecord;
  fertilization?: FertilizationRecord;
  culture?: EmbryoCultureRecord;
  transfer?: TransferRecord;
  freeze?: FreezeRecord;
  pgt?: PGTRecord;
}

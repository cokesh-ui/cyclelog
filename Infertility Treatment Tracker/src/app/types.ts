// 주사/약 기록
export interface InjectionRecord {
  id: string;
  medicationName: string;
  dosage: string;
  date: string;
  time?: string;
  memo?: string;
}

// 채취 기록
export interface RetrievalRecord {
  retrievalDate: string;
  totalEggs: number;
  memo?: string;
}

// 수정 기록
export interface FertilizationRecord {
  fertilizationDate: string;
  totalFertilized: number;
  memo?: string;
}

// 3일 배양 기록 (하위 호환성 - 삭제 예정)
export interface Day3Record {
  day?: number; // 배양 일수 (하위 호환성을 위해 optional)
  totalEmbryos: number;
  nextPlan?: 'transfer' | 'freeze'; // 이식 또는 동결
  transferCount?: number; // 이식 개수
  frozenCount?: number; // 동결 개수
  gradeA?: number;
  gradeB?: number;
  gradeC?: number;
  memo?: string;
}

// 5일 배양 기록 (하위 호환성 - 삭제 예정)
export interface Day5Record {
  day?: number; // 배양 일수 (하위 호환성을 위해 optional)
  totalEmbryos: number;
  nextPlan?: 'transfer' | 'freeze' | 'pgt'; // 이식, 동결, 또는 PGT
  transferCount?: number; // 이식 개수
  frozenCount?: number; // 동결 개수 (이식 시 함께 입력)
  pgtCount?: number; // PGT 보낸 개수
  gradeA?: number;
  gradeB?: number;
  gradeC?: number;
  willDoPGT?: boolean; // 삭제 예정 (호환성 유지)
  memo?: string;
}

// 배양 기록 (통합 - 메인)
export interface EmbryoCultureRecord {
  day: number; // 배양 일수 (3, 4, 5 등)
  totalEmbryos: number;
  nextPlans?: ('transfer' | 'freeze' | 'pgt')[]; // 다중 선택 가능
  gradeA?: number;
  gradeB?: number;
  gradeC?: number;
  memo?: string;
}

// 이식 기록
export interface TransferRecord {
  transferDate: string;
  transferCount: number;
  memo?: string;
}

// 동결 기록
export interface FreezeRecord {
  freezeDate: string;
  frozenCount: number;
  memo?: string;
}

// PGT 결과
export interface PGTRecord {
  tested: number;
  euploid: number;
  mosaic?: number;
  abnormal: number;
  resultDate: string;
}

// 사이클
export interface Cycle {
  id: string;
  startDate: string;
  cycleNumber: number; // 회차 번호
  subtitle?: string; // 부제
  title?: string; // 하위 호환성 유지
  injections: InjectionRecord[];
  retrieval?: RetrievalRecord;
  fertilization?: FertilizationRecord;
  culture?: EmbryoCultureRecord; // 통합 배양 기록
  day3?: Day3Record; // 하위 호환성 유지
  day5?: Day5Record; // 하위 호환성 유지
  transfer?: TransferRecord; // 이식 기록
  freeze?: FreezeRecord; // 동결 기록
  pgt?: PGTRecord;
}
import { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronDown, ChevronUp, Syringe, Copy, Edit2 } from 'lucide-react';
import { InjectionRecord } from '../types';
import * as api from '../api';
import { useScrollOnOpen } from '../hooks/useScrollOnOpen';

interface InjectionSectionProps {
  injections: InjectionRecord[];
  cycleId?: string;
  injectionSkipped?: boolean;
  onUpdate: (injections: InjectionRecord[]) => void;
  onSkip?: () => void;
}

const commonMedications = [
  { ko: '고날에프', en: 'Gonal-F' },
  { ko: '폴리트롭', en: 'Follitrope' },
  { ko: '퓨어곤', en: 'Puregon' },
  { ko: '레코벨', en: 'Rekovelle' },
  { ko: '퍼고베리스', en: 'Pergoveris' },
  { ko: '메노푸어', en: 'Menopur' },
  { ko: '메리오날', en: 'Merional' },
  { ko: '가니렐릭스', en: 'Ganirelix' },
  { ko: '가니레버', en: 'Ganirever' },
  { ko: '세트로타이드', en: 'Cetrotide' },
  { ko: '오가루트란', en: 'Orgalutran' },
  { ko: '데카펩틸', en: 'Decapeptyl' },
  { ko: '루프린', en: 'Lupron' },
  { ko: '디페렐린', en: 'Diphereline' },
  { ko: '오비드렐', en: 'Ovidrel' },
  { ko: '프레그닐', en: 'Pregnyl' },
  { ko: '클로미드', en: 'Clomid' },
  { ko: '세로펜', en: 'Serophene' },
  { ko: '페마라', en: 'Femara' },
  { ko: '레트라', en: 'Letra' },
  { ko: '프로기노바', en: 'Progynova' },
  { ko: '에스트로펨', en: 'Estrofem' },
  { ko: '프리마린', en: 'Premarin' },
  { ko: '유트로게스탄', en: 'Utrogestan' },
  { ko: '크리논겔', en: 'Crinone' },
  { ko: '루티너스', en: 'Lutinus' },
  { ko: '듀파스톤', en: 'Duphaston' },
  { ko: '사이클로제스트', en: 'Cyclogest' },
];

const defaultUnits: Record<string, string> = {
  '퓨어곤': 'IU', '고날에프': 'IU', '메노푸어': 'IU', '메리오날': 'IU',
  '폴리트롭': 'IU', '퍼고베리스': 'IU', '레코벨': 'mcg', '프레그닐': 'IU',
  '가니렐릭스': 'mg', '가니레버': 'mg', '세트로타이드': 'mg', '오가루트란': 'mg',
  '오비드렐': 'mcg', '데카펩틸': 'mg', '루프린': 'mg', '디페렐린': 'mg',
  '클로미드': 'mg', '세로펜': 'mg', '페마라': 'mg', '레트라': 'mg',
  '프로기노바': 'mg', '에스트로펨': 'mg', '프리마린': 'mg',
  '유트로게스탄': 'mg', '크리논겔': 'mg', '루티너스': 'mg',
  '듀파스톤': 'mg', '사이클로제스트': 'mg',
};

const unitOptions = ['IU', 'mg', 'mcg', 'ml', '정', '캡슐', 'vial', 'amp', 'pen', 'patch', 'gel', 'tube'];

const frequentMeds = [
  { name: '퓨어곤', dose: '150', unit: 'IU' },
  { name: '가니렐릭스', dose: '0.25', unit: 'mg' },
  { name: '메노푸어', dose: '75', unit: 'IU' },
  { name: '세트로타이드', dose: '0.25', unit: 'mg' },
  { name: '오비드렐', dose: '250', unit: 'mcg' },
];

interface MedicationRow {
  medicationName: string;
  dosage: string;
}

export function InjectionSection({ injections, cycleId, injectionSkipped, onUpdate, onSkip }: InjectionSectionProps) {
  const [isAdding, setIsAdding] = useState(injections.length === 0 && !injectionSkipped);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(injections.length === 0 && !injectionSkipped);
  const sectionRef = useScrollOnOpen(isOpen, isAdding);
  const doseInputRef = useRef<HTMLInputElement>(null);

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('');
  const [formMemo, setFormMemo] = useState('');
  const [formMeds, setFormMeds] = useState<MedicationRow[]>([]);

  // 바텀시트 상태
  const [showMedSheet, setShowMedSheet] = useState(false);
  const [sheetMedName, setSheetMedName] = useState('');
  const [sheetDoseAmount, setSheetDoseAmount] = useState('');
  const [sheetDoseUnit, setSheetDoseUnit] = useState('IU');

  // 바텀시트 scroll lock
  useEffect(() => {
    if (showMedSheet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMedSheet]);

  // 날짜별로 그룹화
  const groupedByDate = injections.reduce((acc, inj) => {
    const date = inj.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(inj);
    return acc;
  }, {} as Record<string, InjectionRecord[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // 가장 최근 날짜의 처방 가져오기
  const importPreviousPrescription = () => {
    if (sortedDates.length === 0) return;
    const latestDate = sortedDates[0];
    const latestInjections = groupedByDate[latestDate];
    setFormMeds(latestInjections.map(inj => ({
      medicationName: inj.medicationName,
      dosage: inj.dosage,
    })));
    setFormTime(latestInjections[0]?.time || '');
  };

  const removeMedRow = (index: number) => {
    setFormMeds(formMeds.filter((_, i) => i !== index));
  };

  // 바텀시트
  const openMedSheet = () => {
    setSheetMedName('');
    setSheetDoseAmount('');
    setSheetDoseUnit('IU');
    setShowMedSheet(true);
  };

  const selectSheetMed = (name: string, dose: string, unit: string) => {
    setSheetMedName(name);
    setSheetDoseAmount(dose);
    setSheetDoseUnit(unit);
    setTimeout(() => doseInputRef.current?.focus(), 100);
  };

  const addFromSheet = () => {
    if (!sheetMedName || !sheetDoseAmount) return;
    setFormMeds([...formMeds, {
      medicationName: sheetMedName,
      dosage: `${sheetDoseAmount}${sheetDoseUnit}`,
    }]);
    setShowMedSheet(false);
  };

  // 서제스트 칩 필터링
  const filteredChips = sheetMedName
    ? frequentMeds.filter(m => m.name.includes(sheetMedName))
    : frequentMeds;

  // 자동완성 (타이핑 시 한글/영문 모두 검색, 정확히 일치하면 숨김)
  const filteredAutoComplete = sheetMedName
    ? commonMedications.filter(m => {
        const q = sheetMedName.toLowerCase();
        return (m.ko.includes(sheetMedName) || m.en.toLowerCase().includes(q)) && m.ko !== sheetMedName;
      })
    : [];

  const handleEditDate = (date: string) => {
    const dateInjections = groupedByDate[date];
    setEditingDate(date);
    setFormDate(date);
    setFormTime(dateInjections[0]?.time || '');
    setFormMemo(dateInjections[0]?.memo || '');
    setFormMeds(dateInjections.map(inj => ({
      medicationName: inj.medicationName,
      dosage: inj.dosage,
    })));
    setIsAdding(true);
  };

  const handleSave = async () => {
    const validMeds = formMeds.filter(m => m.medicationName && m.dosage);
    if (validMeds.length === 0 || !formDate) return;

    if (editingDate && cycleId) {
      const existingInjections = groupedByDate[editingDate] || [];
      for (const inj of existingInjections) {
        await api.deleteInjection(cycleId, inj.id);
      }
      const newInjections: InjectionRecord[] = [];
      for (const med of validMeds) {
        const created = await api.addInjection(cycleId, {
          medicationName: med.medicationName,
          dosage: med.dosage,
          date: formDate,
          time: formTime || undefined,
          memo: formMemo || undefined,
        });
        newInjections.push(created);
      }
      const remaining = injections.filter(inj => inj.date !== editingDate);
      onUpdate([...remaining, ...newInjections]);
    } else if (cycleId) {
      const newInjections: InjectionRecord[] = [];
      for (const med of validMeds) {
        const created = await api.addInjection(cycleId, {
          medicationName: med.medicationName,
          dosage: med.dosage,
          date: formDate,
          time: formTime || undefined,
          memo: formMemo || undefined,
        });
        newInjections.push(created);
      }
      onUpdate([...injections, ...newInjections]);
    } else {
      const newInjections: InjectionRecord[] = validMeds.map(med => ({
        id: Date.now().toString() + Math.random(),
        medicationName: med.medicationName,
        dosage: med.dosage,
        date: formDate,
        time: formTime || undefined,
        memo: formMemo || undefined,
      }));
      if (editingDate) {
        const remaining = injections.filter(inj => inj.date !== editingDate);
        onUpdate([...remaining, ...newInjections]);
      } else {
        onUpdate([...injections, ...newInjections]);
      }
    }
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingDate(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('');
    setFormMemo('');
    setFormMeds([]);
    setShowMedSheet(false);
  };

  const handleCancel = () => resetForm();

  const startAdding = () => {
    setEditingDate(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('');
    setFormMemo('');
    setFormMeds([]);
    setIsAdding(true);
  };

  // 접힌 상태 - 데이터 없음
  if (!isOpen && injections.length === 0 && !injectionSkipped) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between active:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-700">처방</h2>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 접힌 상태 - 데이터 있음
  if (!isOpen) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between active:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Syringe className="w-5 h-5 text-pink-500 flex-shrink-0" />
            <h2 className="text-lg font-semibold flex-shrink-0">처방</h2>
            {injectionSkipped && injections.length === 0 ? (
              <span className="text-sm text-gray-400">건너뜀</span>
            ) : (
              <span className="text-sm text-pink-600 truncate">{[...new Set(injections.map(inj => inj.medicationName))].join(', ')}</span>
            )}
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태
  return (
    <div ref={sectionRef} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        {(injections.length > 0 || injectionSkipped) ? (
          <button
            onClick={() => { setIsOpen(false); resetForm(); }}
            className="flex items-center gap-2"
          >
            <Syringe className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold">처방</h2>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold">처방</h2>
          </div>
        )}
        <div className="flex items-center gap-3">
          {!isAdding && (
            <button
              onClick={startAdding}
              className="text-gray-400 hover:text-gray-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {(injections.length > 0 || injectionSkipped) && (
            <button
              onClick={() => { setIsOpen(false); resetForm(); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 입력 폼 */}
      {isAdding && (
        <div className="mb-4">
          {/* 날짜 */}
          <div className="mb-4">
            <label className="block text-sm mb-1">날짜</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl text-[15px]"
              required
            />
          </div>

          {/* 빈 상태: 지난 처방 가져오기 + 약 추가 */}
          {formMeds.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6">
              {injections.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={importPreviousPrescription}
                    className="w-full py-2.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium border border-orange-200 flex items-center justify-center gap-1.5 active:bg-orange-100 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    지난 처방 가져오기
                  </button>
                  <span className="text-xs text-gray-400">또는</span>
                </>
              )}
              <button
                type="button"
                onClick={openMedSheet}
                className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 flex items-center justify-center gap-1 active:border-orange-300 active:text-orange-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                약 추가
              </button>
              <div className="flex items-center justify-end w-full mt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm text-gray-600 active:text-gray-900 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 구분선 */}
              <div className="border-t border-gray-100 mb-4"></div>

              {/* 처방약 - orange 칩 목록 */}
              <div className="mb-4">
                <label className="block text-sm mb-2">처방약</label>
                <div className="space-y-2">
                  {formMeds.map((med, index) => {
                    const enName = commonMedications.find(m => m.ko === med.medicationName)?.en;
                    return (
                    <div key={index} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                      <span className="text-[15px] font-medium text-gray-900">
                        {med.medicationName}
                        {enName && <span className="text-gray-400 text-[12px] ml-1">{enName}</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-orange-600 font-medium">{med.dosage}</span>
                        <button
                          type="button"
                          onClick={() => removeMedRow(index)}
                          className="text-gray-300 active:text-gray-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* + 약 추가 버튼 */}
                <button
                  type="button"
                  onClick={openMedSheet}
                  className="w-full mt-2.5 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 flex items-center justify-center gap-1 active:border-orange-300 active:text-orange-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  약 추가
                </button>
              </div>

              {/* 메모 */}
              <div className="mb-4">
                <label className="block text-sm mb-1">메모</label>
                <textarea
                  value={formMemo}
                  onChange={(e) => setFormMemo(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-[15px]"
                  maxLength={30}
                  rows={2}
                  placeholder="오늘 처방 관련 메모"
                />
              </div>

              {/* 버튼 */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-sm text-gray-500 active:text-gray-900 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium active:bg-orange-600 transition-colors"
                >
                  저장
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 날짜별 카드 목록 */}
      {injections.length === 0 && injectionSkipped ? (
        <div className="text-center py-8">
          <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">처방 건너뜀</span>
        </div>
      ) : injections.length === 0 ? (
        <div className="text-center py-4">
          {!isAdding && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 text-sm text-gray-500 underline active:text-gray-700"
            >
              처방입력 건너뛰기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date, dateIndex) => {
            const dateInjections = groupedByDate[date];
            const displayDate = (() => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            })();
            const memo = dateInjections.find(inj => inj.memo)?.memo;

            return (
              <div key={date}>
                {dateIndex > 0 && <div className="border-t border-gray-100 mb-4" />}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[15px] font-semibold text-gray-900 flex-shrink-0">{displayDate}</span>
                    {memo && (
                      <span className="text-[13px] text-gray-400 truncate">{memo}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEditDate(date)}
                    className="text-gray-400 active:text-gray-600 transition-colors flex-shrink-0 p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {dateInjections.map((injection) => {
                    const enName = commonMedications.find(m => m.ko === injection.medicationName)?.en;
                    return (
                    <div key={injection.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <span className="text-[15px] font-medium text-gray-900">
                        {injection.medicationName}
                        {enName && <span className="text-gray-400 text-[12px] ml-1">{enName}</span>}
                      </span>
                      <span className="text-[14px] text-blue-600 font-medium">{injection.dosage}</span>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 약 추가 바텀시트 */}
      {showMedSheet && (
        <>
          {/* 백드롭 */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowMedSheet(false)}
          />
          {/* 시트 */}
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white rounded-t-2xl shadow-2xl max-w-md mx-auto">
              {/* 핸들 */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="px-5 pb-24">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[17px] font-bold text-gray-900">약 추가</h3>
                  <button
                    type="button"
                    onClick={() => setShowMedSheet(false)}
                    className="text-gray-400 active:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 약 이름 입력 */}
                <div className="mb-4 relative">
                  <label className="block text-sm mb-1">약 이름</label>
                  <input
                    type="text"
                    value={sheetMedName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSheetMedName(val);
                      // 약 이름 입력 시 기본 단위 설정 (한글 또는 영문 정확 매치)
                      const unit = defaultUnits[val];
                      if (unit) {
                        setSheetDoseUnit(unit);
                      } else {
                        const match = commonMedications.find(m => m.en.toLowerCase() === val.toLowerCase());
                        if (match) {
                          setSheetMedName(match.ko);
                          setSheetDoseUnit(defaultUnits[match.ko] || 'mg');
                        }
                      }
                    }}
                    placeholder="약 이름을 입력하세요"
                    className={`w-full px-4 py-3.5 border border-gray-300 text-[16px] focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition-colors ${
                      sheetMedName && filteredAutoComplete.length > 0 ? 'rounded-t-xl rounded-b-none border-b-0' : 'rounded-xl'
                    }`}
                    autoFocus
                  />

                  {/* 자동완성 드롭다운 — 입력창 바로 아래 붙음 */}
                  {sheetMedName && filteredAutoComplete.length > 0 && (
                    <div className="border border-gray-300 border-t border-t-gray-200 rounded-b-xl overflow-hidden bg-white max-h-40 overflow-y-auto">
                      {filteredAutoComplete.map((m) => (
                        <button
                          key={m.ko}
                          type="button"
                          onClick={() => {
                            setSheetMedName(m.ko);
                            setSheetDoseUnit(defaultUnits[m.ko] || 'mg');
                            setTimeout(() => doseInputRef.current?.focus(), 100);
                          }}
                          className="w-full text-left px-4 py-3 active:bg-orange-50 transition-colors text-[15px] border-b border-gray-100 last:border-0"
                        >
                          {m.ko} <span className="text-gray-400 text-[13px]">{m.en}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 서제스트 칩 — 입력 비어있을 때만 표시 */}
                  {!sheetMedName && filteredChips.length > 0 && (
                    <div className="mt-2">
                      <div className="text-[11px] text-gray-400 mb-1.5">자주 사용하는 약</div>
                      <div className="flex flex-wrap gap-1.5">
                        {filteredChips.map((m) => (
                          <button
                            key={m.name}
                            type="button"
                            onClick={() => selectSheetMed(m.name, m.dose, m.unit)}
                            className="px-3 py-1.5 bg-gray-100 rounded-lg text-[13px] text-gray-600 active:bg-orange-50 active:text-orange-600 transition-colors"
                          >
                            {m.name} <span className="text-gray-400">{m.dose}{m.unit}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 용량 입력 (숫자 + 단위) */}
                <div className="mb-6">
                  <label className="block text-sm mb-1">용량</label>
                  <div className="flex gap-2">
                    <input
                      ref={doseInputRef}
                      type="text"
                      inputMode="decimal"
                      value={sheetDoseAmount}
                      onChange={(e) => setSheetDoseAmount(e.target.value)}
                      placeholder="숫자"
                      className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl text-[16px] focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition-colors"
                    />
                    <select
                      value={sheetDoseUnit}
                      onChange={(e) => setSheetDoseUnit(e.target.value)}
                      className="px-3 py-3.5 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-700 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                    >
                      {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                {/* 추가 버튼 */}
                <button
                  type="button"
                  onClick={addFromSheet}
                  className="w-full py-3.5 bg-orange-500 text-white rounded-xl text-[15px] font-medium active:bg-orange-600 transition-colors"
                >
                  추가하기
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

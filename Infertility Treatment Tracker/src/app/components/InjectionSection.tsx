import { useState, useEffect, useRef } from 'react';
import { X, Plus, Save, Edit, ChevronDown } from 'lucide-react';
import { InjectionRecord } from '../types';
import * as api from '../api';

interface InjectionSectionProps {
  injections: InjectionRecord[];
  cycleId?: string;
  onUpdate: (injections: InjectionRecord[]) => void;
}

const commonMedications = [
  '고날에프',
  '폴리트롭',
  '퓨어곤',
  '퍼고베리스',
  '메노푸어',
  '메리오날',
  '가니렐릭스',
  '세트로타이드',
  '오비드렐',
  '데카펩틸',
  '클로미펜 (클로미드)',
  '레트로졸 (페마라)',
  '레코벨',
  '브레트라정',
];

export function InjectionSection({ injections, cycleId, onUpdate }: InjectionSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastUsedTime, setLastUsedTime] = useState<string>('');
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const medicationDropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    memo: '',
  });

  // 첫 번째 약의 시간을 기억
  useEffect(() => {
    if (formData.time && !editingId) {
      setLastUsedTime(formData.time);
    }
  }, [formData.time, editingId]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (medicationDropdownRef.current && !medicationDropdownRef.current.contains(event.target as Node)) {
        setShowMedicationDropdown(false);
      }
    };

    if (showMedicationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMedicationDropdown]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // 수정
      if (cycleId) {
        const updated = await api.updateInjection(cycleId, editingId, {
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          date: formData.date,
          time: formData.time || undefined,
          memo: formData.memo || undefined,
        });
        onUpdate(injections.map((inj) => inj.id === editingId ? updated : inj));
      } else {
        const updated = injections.map((inj) =>
          inj.id === editingId
            ? { ...formData, id: editingId, time: formData.time || undefined, memo: formData.memo || undefined }
            : inj
        );
        onUpdate(updated);
      }
      setEditingId(null);
    } else {
      // 추가
      if (cycleId) {
        const created = await api.addInjection(cycleId, {
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          date: formData.date,
          time: formData.time || undefined,
          memo: formData.memo || undefined,
        });
        onUpdate([...injections, created]);
      } else {
        const newInjection: InjectionRecord = {
          id: Date.now().toString(),
          ...formData,
          time: formData.time || undefined,
          memo: formData.memo || undefined,
        };
        onUpdate([...injections, newInjection]);
      }
    }

    // 폼 리셋 (날짜와 시간은 유지)
    setFormData({
      medicationName: '',
      dosage: '',
      date: formData.date,
      time: lastUsedTime,
      memo: '',
    });
  };

  const handleComplete = async () => {
    // 현재 입력 중인 내용이 있으면 저장
    if (formData.medicationName && formData.dosage && formData.date) {
      if (cycleId) {
        const created = await api.addInjection(cycleId, {
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          date: formData.date,
          time: formData.time || undefined,
          memo: formData.memo || undefined,
        });
        onUpdate([...injections, created]);
      } else {
        const newInjection: InjectionRecord = {
          id: Date.now().toString(),
          ...formData,
          time: formData.time || undefined,
          memo: formData.memo || undefined,
        };
        onUpdate([...injections, newInjection]);
      }
    }

    setIsAdding(false);
    setEditingId(null);
    setLastUsedTime('');
    setFormData({
      medicationName: '',
      dosage: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      memo: '',
    });
  };

  const handleEdit = () => {
    setIsAdding(true);
  };

  const handleEditInjection = (injection: InjectionRecord) => {
    setEditingId(injection.id);
    setFormData({
      medicationName: injection.medicationName,
      dosage: injection.dosage,
      date: injection.date,
      time: injection.time || '',
      memo: injection.memo || '',
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (cycleId) {
      await api.deleteInjection(cycleId, id);
    }
    onUpdate(injections.filter((inj) => inj.id !== id));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setLastUsedTime('');
    setFormData({
      medicationName: '',
      dosage: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      memo: '',
    });
  };

  // 날짜별로 그룹화
  const groupedByDate = injections.reduce((acc, inj) => {
    const date = inj.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(inj);
    return acc;
  }, {} as Record<string, InjectionRecord[]>);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">과배란 처방 기록</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-white text-pink-600 border-2 border-pink-200 rounded-lg hover:bg-pink-50 transition-all"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">약 이름 *</label>
              <div className="relative" ref={medicationDropdownRef}>
                <input
                  type="text"
                  value={formData.medicationName}
                  onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                  onFocus={() => setShowMedicationDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded pr-10"
                  placeholder="약 이름을 선택하거나 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowMedicationDropdown(!showMedicationDropdown)}
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showMedicationDropdown && (() => {
                  const filteredMedications = commonMedications.filter(med =>
                    med.toLowerCase().includes(formData.medicationName.toLowerCase())
                  );

                  return (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
                      {filteredMedications.length > 0 ? (
                        filteredMedications.map((med) => (
                          <button
                            key={med}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, medicationName: med });
                              setShowMedicationDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-pink-50 transition-colors text-sm"
                          >
                            {med}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          검색 결과가 없습니다
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">용량 *</label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="예: 150IU"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">날짜 *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">시간</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">메모</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                maxLength={30}
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              취소
            </button>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all"
              >
                {editingId ? '수정 완료' : '처방 추가'}
              </button>
              {!editingId && (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  <Save className="w-4 h-4" />
                  완료
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {injections.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          주사 기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            .map(([date, dateInjections]) => {
              // 같은 시간끼리 그룹화
              const timeGroups = dateInjections.reduce((acc, inj) => {
                const time = inj.time || '시간 미정';
                if (!acc[time]) {
                  acc[time] = [];
                }
                acc[time].push(inj);
                return acc;
              }, {} as Record<string, InjectionRecord[]>);

              return (
                <div key={date} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-gray-900">{date}</div>

                  </div>

                  <div className="space-y-3">
                    {Object.entries(timeGroups).map(([time, timeInjections]) => (
                      <div key={time} className="bg-white rounded p-3 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">{time}</div>
                        <div className="space-y-1">
                          {timeInjections.map((injection) => (
                            <div key={injection.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{injection.medicationName}</span>
                                <span className="text-blue-600">{injection.dosage}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditInjection(injection)}
                                  className="text-blue-600 hover:bg-blue-50 rounded p-1"
                                  title="수정"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(injection.id)}
                                  className="text-red-600 hover:bg-red-50 rounded p-1"
                                  title="삭제"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

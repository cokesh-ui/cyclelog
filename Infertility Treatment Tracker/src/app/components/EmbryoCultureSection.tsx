import { useState, useEffect } from 'react';
import { Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { EmbryoCultureRecord } from '../types';

interface EmbryoCultureSectionProps {
  culture?: EmbryoCultureRecord;
  fertilizedCount?: number;
  onUpdate: (culture: EmbryoCultureRecord, removedPlans?: ('transfer' | 'freeze' | 'pgt')[]) => void;
  showPlanModal?: boolean;
  onClosePlanModal?: () => void;
}

export function EmbryoCultureSection({ culture, fertilizedCount, onUpdate, showPlanModal, onClosePlanModal }: EmbryoCultureSectionProps) {
  const [isOpen, setIsOpen] = useState(!culture); // 입력되지 않았으면 펼쳐진 상태
  const [isEditing, setIsEditing] = useState(!culture);
  const [showModal, setShowModal] = useState(false);
  const [savedFormData, setSavedFormData] = useState<EmbryoCultureRecord | null>(null);
  
  const [formData, setFormData] = useState<EmbryoCultureRecord>({
    day: culture?.day || 3,
    totalEmbryos: culture?.totalEmbryos || 0,
    nextPlans: culture?.nextPlans || [],
    gradeA: culture?.gradeA,
    gradeB: culture?.gradeB,
    gradeC: culture?.gradeC,
    memo: culture?.memo || '',
  });

  // 외부에서 팝업 열기 요청 처리
  useEffect(() => {
    if (showPlanModal && culture) {
      setSavedFormData(culture);
      setShowModal(true);
    }
  }, [showPlanModal, culture]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 배아 수가 0개인 경우 팝업 없이 바로 저장
    if (formData.totalEmbryos === 0) {
      onUpdate({
        ...formData,
        gradeA: formData.gradeA || undefined,
        gradeB: formData.gradeB || undefined,
        gradeC: formData.gradeC || undefined,
        memo: formData.memo || undefined,
        nextPlans: [],
      });
      setIsEditing(false);
      setIsOpen(false);
      return;
    }
    
    // 배아 수가 1개 이상인 경우 다음 단계 선택 팝업 표시
    setSavedFormData(formData);
    setShowModal(true);
  };

  const handlePlanSelection = (plans?: ('transfer' | 'freeze' | 'pgt')[]) => {
    if (!savedFormData) return;
    
    // 기존에 있었지만 지금은 없는 플랜 찾기 (삭제된 항목)
    const oldPlans = culture?.nextPlans || [];
    const newPlans = plans || [];
    const removedPlans = oldPlans.filter(plan => !newPlans.includes(plan));
    
    onUpdate({
      ...savedFormData,
      gradeA: savedFormData.gradeA || undefined,
      gradeB: savedFormData.gradeB || undefined,
      gradeC: savedFormData.gradeC || undefined,
      memo: savedFormData.memo || undefined,
      nextPlans: plans !== undefined ? (plans.length > 0 ? plans : []) : [],
    }, removedPlans.length > 0 ? removedPlans : undefined);
    
    setIsEditing(false);
    setIsOpen(false);
    setShowModal(false);
    setSavedFormData(null);
    if (onClosePlanModal) onClosePlanModal();
  };

  const togglePlan = (plan: 'transfer' | 'freeze' | 'pgt') => {
    const currentPlans = formData.nextPlans || [];
    let newPlans: ('transfer' | 'freeze' | 'pgt')[];
    
    if (currentPlans.includes(plan)) {
      newPlans = currentPlans.filter(p => p !== plan);
    } else {
      newPlans = [...currentPlans, plan];
    }
    
    setFormData({ ...formData, nextPlans: newPlans });
  };

  const getPlanLabels = (plans?: ('transfer' | 'freeze' | 'pgt')[]) => {
    if (!plans || plans.length === 0) return '미정';
    return plans.map(plan => {
      switch (plan) {
        case 'transfer': return '이식';
        case 'freeze': return '동결';
        case 'pgt': return 'PGT';
        default: return '';
      }
    }).join(', ');
  };

  const shouldShowPGT = formData.day >= 5;

  // 입력되지 않은 경우 접힌 상태로 표시
  if (!isOpen && !culture) {
    return (
      <>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsEditing(true);
            }}
            className="w-full flex items-center justify-between active:bg-gray-50 transition-colors rounded -m-1 p-1"
          >
            <h2 className="text-xl text-gray-700">배양 기록</h2>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* 다음 계획 선택 모달 */}
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">다음 단계를 선택해주세요</h3>
              <p className="text-sm text-gray-600 mb-6">배양 후 진행할 단계를 선택하세요 (중복 선택 가능)</p>
              
              <PlanSelectionModal
                day={savedFormData?.day || 3}
                onSelect={handlePlanSelection}
                onCancel={() => {
                  setShowModal(false);
                  setSavedFormData(null);
                  if (onClosePlanModal) onClosePlanModal();
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && culture) {
    return (
      <>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-xl">배양 기록</h2>
              <span className="text-sm text-purple-600">{culture.day}일 배아</span>
              <span className="text-sm text-blue-600">{culture.totalEmbryos}개</span>
              {culture.nextPlans && culture.nextPlans.length > 0 && (
                <span className="text-xs text-gray-500">· {getPlanLabels(culture.nextPlans)}</span>
              )}
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* 다음 계획 선택 모달 */}
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">다음 단계를 선택해주세요</h3>
              <p className="text-sm text-gray-600 mb-6">배양 후 진행할 단계를 선택하세요 (중복 선택 가능)</p>
              
              <PlanSelectionModal
                day={savedFormData?.day || 3}
                onSelect={handlePlanSelection}
                onCancel={() => {
                  setShowModal(false);
                  setSavedFormData(null);
                  if (onClosePlanModal) onClosePlanModal();
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && culture) {
    return (
      <>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 hover:text-gray-900 transition-colors"
            >
              <h2 className="text-xl">배양 기록</h2>
              <ChevronUp className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => {
                setFormData(culture);
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              수정
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">배양 일수:</span>
              <span className="text-purple-600">{culture.day}일</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">배아 수:</span>
              <span className="text-blue-600 font-bold">{culture.totalEmbryos}개</span>
            </div>
            
            {(culture.gradeA !== undefined || culture.gradeB !== undefined || culture.gradeC !== undefined) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">등급별 수:</div>
                {culture.gradeA !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">A등급:</span>
                    <span>{culture.gradeA}개</span>
                  </div>
                )}
                {culture.gradeB !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">B등급:</span>
                    <span>{culture.gradeB}개</span>
                  </div>
                )}
                {culture.gradeC !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">C등급:</span>
                    <span>{culture.gradeC}개</span>
                  </div>
                )}
              </div>
            )}
            
            {culture.nextPlans && culture.nextPlans.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">다음 계획:</span>
                  <span className="font-medium">{getPlanLabels(culture.nextPlans)}</span>
                </div>
              </div>
            )}
            
            {culture.memo && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-600 text-sm">메모:</span>
                <p className="mt-1 text-sm">{culture.memo}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 다음 계획 선택 모달 */}
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">다음 단계를 선택해주세요</h3>
              <p className="text-sm text-gray-600 mb-6">배양 후 진행할 단계를 선택하세요 (중복 선택 가능)</p>
              
              <PlanSelectionModal
                day={savedFormData?.day || 3}
                onSelect={handlePlanSelection}
                onCancel={() => {
                  setShowModal(false);
                  setSavedFormData(null);
                  if (onClosePlanModal) onClosePlanModal();
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  const currentPlans = formData.nextPlans || [];

  // 펼쳐진 상태 - 편집 모드
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">배양 기록</h2>
        {culture && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-2">배양 일수 *</label>
          <div className="flex gap-2">
            {[3, 4, 5, 6].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  const newPlans = d < 5 ? currentPlans.filter(p => p !== 'pgt') : currentPlans;
                  setFormData({ 
                    ...formData, 
                    day: d,
                    nextPlans: newPlans,
                  });
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  formData.day === d
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d}일
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">배아 수 *</label>
          <input
            type="number"
            min="0"
            value={formData.totalEmbryos || ''}
            onChange={(e) => setFormData({ ...formData, totalEmbryos: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="0"
            required
          />
          {fertilizedCount !== undefined && formData.totalEmbryos > fertilizedCount && (
            <p className="text-xs text-orange-600 mt-1">💡 배아 수가 수정된 난자 수({fertilizedCount}개)보다 많습니다</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700 mb-3">등급별 수 (선택)</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">A등급</label>
              <input
                type="number"
                min="0"
                value={formData.gradeA || ''}
                onChange={(e) => setFormData({ ...formData, gradeA: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">B등급</label>
              <input
                type="number"
                min="0"
                value={formData.gradeB || ''}
                onChange={(e) => setFormData({ ...formData, gradeB: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">C등급</label>
              <input
                type="number"
                min="0"
                value={formData.gradeC || ''}
                onChange={(e) => setFormData({ ...formData, gradeC: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">메모</label>
          <textarea
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            maxLength={30}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => {
              if (culture) {
                setFormData(culture);
                setIsEditing(false);
              } else {
                setIsOpen(false);
              }
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all"
          >
            저장
          </button>
        </div>
      </form>

      {/* 다음 계획 선택 모달 */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">다음 단계를 선택해주세요</h3>
            <p className="text-sm text-gray-600 mb-6">배양 후 진행할 단계를 선택하세요 (중복 선택 가능)</p>
            
            <PlanSelectionModal
              day={savedFormData?.day || 3}
              onSelect={handlePlanSelection}
              onCancel={() => {
                setShowModal(false);
                setSavedFormData(null);
                if (onClosePlanModal) onClosePlanModal();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 계획 선택 모달 컴포넌트
function PlanSelectionModal({ 
  day, 
  onSelect, 
  onCancel 
}: { 
  day: number;
  onSelect: (plans?: ('transfer' | 'freeze' | 'pgt')[]) => void;
  onCancel: () => void;
}) {
  const [selectedPlans, setSelectedPlans] = useState<('transfer' | 'freeze' | 'pgt')[]>([]);
  const shouldShowPGT = day >= 5;

  const togglePlan = (plan: 'transfer' | 'freeze' | 'pgt') => {
    if (selectedPlans.includes(plan)) {
      setSelectedPlans(selectedPlans.filter(p => p !== plan));
    } else {
      setSelectedPlans([...selectedPlans, plan]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer active:bg-pink-50 active:border-pink-300 transition-all">
          <input
            type="checkbox"
            checked={selectedPlans.includes('transfer')}
            onChange={() => togglePlan('transfer')}
            className="w-5 h-5 text-green-600"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">이식</div>
            <div className="text-sm text-gray-500">배아를 이식합니다</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer active:bg-pink-50 active:border-pink-300 transition-all">
          <input
            type="checkbox"
            checked={selectedPlans.includes('freeze')}
            onChange={() => togglePlan('freeze')}
            className="w-5 h-5 text-blue-600"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">동결</div>
            <div className="text-sm text-gray-500">배아를 동결 보관합니다</div>
          </div>
        </label>

        {shouldShowPGT && (
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer active:bg-pink-50 active:border-pink-300 transition-all">
            <input
              type="checkbox"
              checked={selectedPlans.includes('pgt')}
              onChange={() => togglePlan('pgt')}
              className="w-5 h-5 text-purple-600"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">PGT</div>
              <div className="text-sm text-gray-500">유전자 검사를 진행합니다</div>
            </div>
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => onSelect(undefined)}
          className="flex-1 px-4 py-3 bg-pink-100 text-pink-600 rounded-lg active:bg-pink-200 transition-colors font-medium"
        >
          다음에 입력하기
        </button>
        <button
          onClick={() => onSelect(selectedPlans.length > 0 ? selectedPlans : undefined)}
          className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg active:bg-pink-700 transition-colors font-medium"
        >
          확인
        </button>
      </div>
    </div>
  );
}
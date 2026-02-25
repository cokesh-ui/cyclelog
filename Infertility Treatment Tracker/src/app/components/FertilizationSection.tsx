import { useState, useEffect } from 'react';
import { Edit2, ChevronDown, ChevronUp, TestTubes } from 'lucide-react';
import { FertilizationRecord } from '../types';
import { useScrollOnOpen } from '../hooks/useScrollOnOpen';

interface FertilizationSectionProps {
  fertilization?: FertilizationRecord;
  retrievalDate?: string;
  retrievalCount?: number;
  onUpdate: (fertilization: FertilizationRecord) => void;
}

export function FertilizationSection({ fertilization, retrievalDate, retrievalCount, onUpdate }: FertilizationSectionProps) {
  const [isOpen, setIsOpen] = useState(!fertilization);
  const [isEditing, setIsEditing] = useState(!fertilization);
  const sectionRef = useScrollOnOpen(isOpen, isEditing);
  const [formData, setFormData] = useState<FertilizationRecord>(
    fertilization || {
      fertilizationDate: retrievalDate || new Date().toISOString().split('T')[0],
      totalFertilized: 0,
      memo: '',
    }
  );

  // retrievalDate가 변경될 때 formData의 fertilizationDate를 업데이트
  useEffect(() => {
    if (!fertilization && retrievalDate) {
      setFormData(prev => ({
        ...prev,
        fertilizationDate: retrievalDate
      }));
    }
  }, [retrievalDate, fertilization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      memo: formData.memo || undefined,
    });
    setIsEditing(false);
    setIsOpen(false);
  };

  // 입력되지 않은 경우 접힌 상태로 표시
  if (!isOpen && !fertilization) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          className="w-full flex items-center justify-between active:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-2">
            <TestTubes className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-700">수정</h2>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  // 입력된 경우 접을 수 있는 표시 상태
  if (!isOpen && fertilization) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded -m-1 p-1"
        >
          <div className="flex items-center gap-2 min-w-0">
            <TestTubes className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <h2 className="text-lg font-semibold flex-shrink-0">수정</h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-full flex-shrink-0">{fertilization.totalFertilized}개</span>
            {fertilization.memo && (
              <span className="text-sm text-gray-400 truncate">{fertilization.memo}</span>
            )}
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>
      </div>
    );
  }

  // 펼쳐진 상태 - 보기 모드
  if (isOpen && !isEditing && fertilization) {
    return (
      <div ref={sectionRef} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2"
          >
            <TestTubes className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">수정</h2>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormData(fertilization);
                setIsEditing(true);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">수정된 난자 수:</span>
            <span className="font-bold text-blue-600 text-[16px]">{fertilization.totalFertilized}개</span>
          </div>
          {fertilization.memo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">메모:</span>
              <p className="mt-1 text-sm">{fertilization.memo}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 펼쳐진 상태 - 편집 모드
  return (
    <div ref={sectionRef} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TestTubes className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">수정</h2>
        </div>
        {fertilization && (
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
          <label className="block text-sm mb-1">수정된 난자 수 *</label>
          <input
            type="number"
            min="0"
            value={formData.totalFertilized}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setFormData({ ...formData, totalFertilized: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="0"
            required
          />
          {retrievalCount !== undefined && formData.totalFertilized > retrievalCount && (
            <p className="text-xs text-orange-600 mt-1">💡 수정된 난자수가 채취한 난자 수({retrievalCount}개)보다 많습니다</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">메모</label>
          <textarea
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="수정 방법 (일반 수정, ICSI 등) 또는 기타 메모"
            maxLength={30}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => {
              if (fertilization) {
                setFormData(fertilization);
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
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}